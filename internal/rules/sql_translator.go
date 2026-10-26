package rules

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/moul-dev/moul-dev/internal/cloak"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

// Standard system fields present across auth, worker, analytic, or base tables.
var standardFields = map[string]bool{
	"id":                     true,
	"created":                true,
	"updated":                true,
	"createdAt":              true,
	"updatedAt":              true,
	"created_at":             true,
	"updated_at":             true,
	"inserted_at":            true,
	"scheduled_at":           true,
	"state":                  true,
	"worker":                 true,
	"queue":                  true,
	"attempt":                true,
	"errors":                 true,
	"max_attempts":           true,
	"priority":               true,
	"args":                   true,
	"meta":                   true,
	"tags":                   true,
	"username":               true,
	"email":                  true,
	"emailVisibility":        true,
	"verified":               true,
	"tokenKey":               true,
	"passwordHash":           true,
	"lastResetSentAt":        true,
	"lastVerificationSentAt": true,
	"avatar":                 true,
	"name":                   true,
	"properties":             true,
	"visit_token":            true,
	"visitor_token":          true,
	"user_id":                true,
	"ip":                     true,
	"user_agent":             true,
	"referrer":               true,
	"landing_page":           true,
}

// IsValidField checks if a field name exists in the moul schema or standard fields, or is a valid relation path.
func IsValidField(fieldName string, moul *schema.Moul) bool {
	if standardFields[fieldName] {
		return true
	}
	if moul != nil {
		if strings.Contains(fieldName, ".") {
			parts := strings.Split(fieldName, ".")
			for _, f := range moul.Fields {
				if f.Name == parts[0] && f.Type == "relation" {
					return true
				}
			}
		}
		for _, f := range moul.Fields {
			if f.Name == fieldName {
				return true
			}
		}
	}
	return false
}

// secretFields are columns no client-supplied filter, sort or search may reference: credentials,
// one-time codes, reset tokens and linked OAuth identities.
var secretFields = map[string]bool{
	"passwordhash":        true,
	"tokenkey":            true,
	"otpcode":             true,
	"otpexpiresat":        true,
	"passkeys":            true,
	"resettoken":          true,
	"resettokenexpiresat": true,
	"oauthproviders":      true,
}

// IsSecretField reports whether a column of moul may never be probed by a non-admin caller:
// credentials and tokens on every collection, and the email of auth collections.
func IsSecretField(fieldName string, moul *schema.Moul) bool {
	lower := strings.ToLower(fieldName)
	if secretFields[lower] {
		return true
	}
	return lower == "email" && (moul == nil || moul.Type == "auth")
}

// subqueryAlias names the table of a top-level relation or @collection subquery, so columns
// qualified with the outer table name keep referring to the outer row even when both tables are
// the same. Subqueries nested inside a target's rule get their own alias per depth (subAlias).
const subqueryAlias = "_sub"

// identPattern matches a plain column name that is safe to quote into SQL.
var identPattern = regexp.MustCompile(`^[A-Za-z_][A-Za-z0-9_]*$`)

// SortOptions tunes BuildSortSQLWithOptions.
type SortOptions struct {
	// Untrusted marks a client-supplied sort (?sort=): secret columns are refused, and so is a
	// relation path into a collection whose rows are not publicly listable.
	Untrusted bool
	// LoadMoul resolves relation targets so their columns can be validated. Without it relation
	// paths are refused.
	LoadMoul func(name string) (*schema.Moul, error)
}

// BuildSortSQL converts a comma-separated sort string (e.g. "-created,title", "@random", "-author.name")
// into sanitized SQL ORDER BY expressions. It trusts its input (admin-defined); client-supplied
// sorts must use BuildSortSQLWithOptions with Untrusted set.
func BuildSortSQL(sortStr string, moul *schema.Moul) ([]string, error) {
	return BuildSortSQLWithOptions(sortStr, moul, SortOptions{})
}

// BuildSortSQLWithOptions converts a comma-separated sort string into quoted SQL ORDER BY
// expressions. Every column, including the column of a relation target, is validated against its
// schema before it is quoted into the statement.
func BuildSortSQLWithOptions(sortStr string, moul *schema.Moul, opts SortOptions) ([]string, error) {
	if strings.TrimSpace(sortStr) == "" {
		return nil, nil
	}
	parts := strings.Split(sortStr, ",")
	var result []string

	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		direction := "ASC"
		fieldName := part
		if strings.HasPrefix(part, "-") {
			direction = "DESC"
			fieldName = strings.TrimPrefix(part, "-")
		} else if strings.HasPrefix(part, "+") {
			fieldName = strings.TrimPrefix(part, "+")
		}

		if fieldName == "@random" {
			result = append(result, "RANDOM()")
			continue
		}

		if strings.Contains(fieldName, ".") {
			expr, err := relationSortExpr(fieldName, direction, moul, opts)
			if err != nil {
				return nil, err
			}
			result = append(result, expr)
			continue
		}

		if !identPattern.MatchString(fieldName) || !IsValidField(fieldName, moul) {
			return nil, fmt.Errorf("invalid sort field %q", fieldName)
		}
		if opts.Untrusted && IsSecretField(fieldName, moul) {
			return nil, fmt.Errorf("sorting by %q is not allowed", fieldName)
		}
		// identPattern and the schema check make the bare name safe to emit as is.
		result = append(result, fmt.Sprintf("%s %s", fieldName, direction))
	}

	return result, nil
}

// relationSortExpr builds the ORDER BY subquery of a "relation.column" sort term.
func relationSortExpr(path, direction string, moul *schema.Moul, opts SortOptions) (string, error) {
	relParts := strings.Split(path, ".")
	if len(relParts) != 2 || !identPattern.MatchString(relParts[0]) || !identPattern.MatchString(relParts[1]) {
		return "", fmt.Errorf("invalid sort field %q", path)
	}
	relField := findRelationField(moul, relParts[0])
	if relField == nil {
		return "", fmt.Errorf("invalid sort field %q", path)
	}
	targetMoul, err := loadTarget(opts.LoadMoul, relField.RelationConfig.TargetMoul)
	if err != nil {
		return "", fmt.Errorf("invalid sort field %q: %w", path, err)
	}
	subCol := relParts[1]
	if !IsValidField(subCol, targetMoul) {
		return "", fmt.Errorf("invalid sort field %q", path)
	}
	if opts.Untrusted {
		if IsSecretField(subCol, targetMoul) {
			return "", fmt.Errorf("sorting by %q is not allowed", path)
		}
		if strings.TrimSpace(targetMoul.Rules.ListRule) != "" {
			return "", fmt.Errorf("sorting by %q is not allowed: %s records are not public", path, targetMoul.Name)
		}
	}

	target := db.QuoteIdentifier(targetMoul.Name)
	outer := db.QuoteIdentifier(relParts[0])
	if moul != nil {
		outer = db.QuoteIdentifier(moul.Name) + "." + outer
	}
	col := subqueryAlias + "." + db.QuoteIdentifier(subCol)
	switch relField.RelationConfig.Cardinality {
	case "1:1", "1:N":
		return fmt.Sprintf("(SELECT %s FROM %s AS %s WHERE %s.id = %s) %s", col, target, subqueryAlias, subqueryAlias, outer, direction), nil
	case "M:N":
		return fmt.Sprintf("(SELECT %s FROM %s AS %s JOIN json_each(%s) WHERE %s.id = json_each.value LIMIT 1) %s", col, target, subqueryAlias, outer, subqueryAlias, direction), nil
	}
	return "", fmt.Errorf("unsupported relation cardinality %q", relField.RelationConfig.Cardinality)
}

// findRelationField returns the relation field named name of moul, or nil.
func findRelationField(moul *schema.Moul, name string) *schema.MoulField {
	if moul == nil {
		return nil
	}
	for _, f := range moul.Fields {
		if f.Name == name && f.Type == "relation" && f.RelationConfig != nil {
			tf := f
			return &tf
		}
	}
	return nil
}

// loadTarget resolves a relation target collection through load.
func loadTarget(load func(string) (*schema.Moul, error), name string) (*schema.Moul, error) {
	if load == nil {
		return nil, fmt.Errorf("relation paths are not supported here")
	}
	if err := db.ValidateTableName(name); err != nil {
		return nil, err
	}
	target, err := load(name)
	if err != nil {
		return nil, fmt.Errorf("unknown relation target %q: %w", name, err)
	}
	return target, nil
}

// FilterOptions tunes BuildFilterSQLWithOptions.
type FilterOptions struct {
	// ParamPrefix namespaces placeholder names ("<prefix>p1", ...) so several translated
	// expressions can be bound in one query without overwriting each other's values.
	ParamPrefix string
	// Untrusted marks a client-supplied filter (?filter=). It may not reference other collections
	// (@collection) or secret columns, and a relation path only matches target rows the caller may
	// list (the target's ListRule is added to the subquery).
	Untrusted bool
	// LoadMoul resolves relation targets so their columns can be validated. Without it relation
	// paths are refused.
	LoadMoul func(name string) (*schema.Moul, error)
}

// paramState is shared by a builder and the builders of nested rules, so placeholder names stay
// unique across the whole expression.
type paramState struct {
	prefix  string
	counter int
	params  dbx.Params
}

type sqlBuilder struct {
	tokens     []Token
	pos        int
	moul       *schema.Moul
	authRecord map[string]interface{}
	reqContext map[string]interface{}
	opts       FilterOptions
	state      *paramState
	params     dbx.Params
	// depth is 0 for the top-level expression and grows for each nested target rule.
	depth int
	// selfRef is how this builder's own table is referenced: "" at the top level (the query's
	// table, qualified by name), or the alias of the subquery a nested rule is translated into.
	selfRef string
}

// subAlias is the alias of the subqueries this builder creates.
func (b *sqlBuilder) subAlias() string {
	if b.depth == 0 {
		return subqueryAlias
	}
	return fmt.Sprintf("%s%d", subqueryAlias, b.depth)
}

func newSQLBuilder(tokens []Token, moul *schema.Moul, authRecord map[string]interface{}, reqContext map[string]interface{}) *sqlBuilder {
	reqMap := map[string]interface{}{
		"query":   map[string]interface{}{},
		"headers": map[string]interface{}{},
	}
	for k, v := range reqContext {
		reqMap[k] = v
	}
	state := &paramState{params: make(dbx.Params)}
	return &sqlBuilder{
		tokens:     tokens,
		moul:       moul,
		authRecord: authRecord,
		reqContext: reqMap,
		state:      state,
		params:     state.params,
	}
}

func (b *sqlBuilder) nextParamName() string {
	b.state.counter++
	return fmt.Sprintf("%sp%d", b.state.prefix, b.state.counter)
}

// BuildFilterSQL parses a trusted (admin-defined) filter string into a parameterized SQL WHERE
// expression and dbx.Params map. Client-supplied filters must use BuildFilterSQLWithOptions with
// Untrusted set.
func BuildFilterSQL(
	filterStr string,
	moul *schema.Moul,
	authRecord map[string]interface{},
	requestContext ...map[string]interface{},
) (string, dbx.Params, error) {
	var reqCtx map[string]interface{}
	if len(requestContext) > 0 {
		reqCtx = requestContext[0]
	}
	return BuildFilterSQLWithOptions(filterStr, moul, authRecord, reqCtx, FilterOptions{})
}

// BuildFilterSQLWithOptions parses a filter string into a parameterized SQL WHERE expression and
// dbx.Params map according to opts.
func BuildFilterSQLWithOptions(
	filterStr string,
	moul *schema.Moul,
	authRecord map[string]interface{},
	reqCtx map[string]interface{},
	opts FilterOptions,
) (string, dbx.Params, error) {
	if strings.TrimSpace(filterStr) == "" {
		return "", nil, nil
	}

	tokens, err := Tokenize(filterStr)
	if err != nil {
		return "", nil, fmt.Errorf("failed to tokenize filter: %w", err)
	}
	if len(tokens) == 0 {
		return "", nil, nil
	}

	builder := newSQLBuilder(tokens, moul, authRecord, reqCtx)
	builder.opts = opts
	builder.state.prefix = opts.ParamPrefix
	sqlWhere, err := builder.parseLogicalOr()
	if err != nil {
		return "", nil, err
	}

	if builder.pos < len(builder.tokens) {
		return "", nil, fmt.Errorf("unexpected token %q at position %d", builder.tokens[builder.pos].Value, builder.pos)
	}

	return sqlWhere, builder.params, nil
}

// nestedRuleSQL translates a target collection's (trusted) rule inside this builder's parameter
// namespace, for use within a relation subquery.
func (b *sqlBuilder) nestedRuleSQL(rule string, target *schema.Moul) (string, error) {
	tokens, err := Tokenize(rule)
	if err != nil {
		return "", fmt.Errorf("failed to tokenize %s list rule: %w", target.Name, err)
	}
	nested := &sqlBuilder{
		tokens:     tokens,
		moul:       target,
		authRecord: b.authRecord,
		reqContext: b.reqContext,
		opts:       FilterOptions{LoadMoul: b.opts.LoadMoul},
		state:      b.state,
		params:     b.state.params,
		depth:      b.depth + 1,
		selfRef:    b.subAlias(),
	}
	expr, err := nested.parseLogicalOr()
	if err != nil {
		return "", fmt.Errorf("failed to translate %s list rule: %w", target.Name, err)
	}
	if nested.pos < len(nested.tokens) {
		return "", fmt.Errorf("unexpected token %q in %s list rule", nested.tokens[nested.pos].Value, target.Name)
	}
	return expr, nil
}

func (b *sqlBuilder) parseLogicalOr() (string, error) {
	left, err := b.parseLogicalAnd()
	if err != nil {
		return "", err
	}
	for b.pos < len(b.tokens) {
		tok := b.tokens[b.pos]
		if tok.Type == TokenLogical && (strings.EqualFold(tok.Value, "||") || strings.EqualFold(tok.Value, "or")) {
			b.pos++
			right, err := b.parseLogicalAnd()
			if err != nil {
				return "", err
			}
			left = fmt.Sprintf("(%s OR %s)", left, right)
		} else {
			break
		}
	}
	return left, nil
}

func (b *sqlBuilder) parseLogicalAnd() (string, error) {
	left, err := b.parsePrimary()
	if err != nil {
		return "", err
	}
	for b.pos < len(b.tokens) {
		tok := b.tokens[b.pos]
		if tok.Type == TokenLogical && (strings.EqualFold(tok.Value, "&&") || strings.EqualFold(tok.Value, "and")) {
			b.pos++
			right, err := b.parsePrimary()
			if err != nil {
				return "", err
			}
			left = fmt.Sprintf("(%s AND %s)", left, right)
		} else {
			break
		}
	}
	return left, nil
}

func (b *sqlBuilder) parsePrimary() (string, error) {
	if b.pos >= len(b.tokens) {
		return "", fmt.Errorf("unexpected end of filter expression")
	}
	tok := b.tokens[b.pos]

	if tok.Type == TokenOperator && (tok.Value == "!" || strings.EqualFold(tok.Value, "not")) {
		b.pos++
		sub, err := b.parsePrimary()
		if err != nil {
			return "", err
		}
		return fmt.Sprintf("(NOT %s)", sub), nil
	}

	if tok.Type == TokenParen && tok.Value == "(" {
		b.pos++
		expr, err := b.parseLogicalOr()
		if err != nil {
			return "", err
		}
		if b.pos >= len(b.tokens) || b.tokens[b.pos].Type != TokenParen || b.tokens[b.pos].Value != ")" {
			return "", fmt.Errorf("missing closing parenthesis")
		}
		b.pos++
		return fmt.Sprintf("(%s)", expr), nil
	}

	return b.parseComparison()
}

func (b *sqlBuilder) parseComparison() (string, error) {
	if b.pos >= len(b.tokens) {
		return "", fmt.Errorf("unexpected end of filter expression")
	}

	leftTok := b.tokens[b.pos]

	// Handle relational field paths (e.g. author.name = "Alice", buyers.email ~ "example.com")
	if leftTok.Type == TokenIdentifier && b.isRelationPath(leftTok.Value) {
		return b.parseRelationalComparison()
	}

	// Handle @collection subqueries (e.g. @collection.posts.user_id = id)
	if leftTok.Type == TokenIdentifier && strings.HasPrefix(leftTok.Value, "@collection.") {
		return b.parseCollectionSubquery()
	}

	leftExpr, leftVal, isCol, err := b.resolveToken(leftTok)
	if err != nil {
		return "", err
	}
	b.pos++

	// Check if there is an operator following
	if b.pos >= len(b.tokens) || b.tokens[b.pos].Type != TokenOperator {
		if isCol {
			return fmt.Sprintf("%s IS NOT NULL AND %s != 0 AND %s != ''", leftExpr, leftExpr, leftExpr), nil
		}
		if leftVal != nil {
			pName := b.nextParamName()
			b.params[pName] = leftVal
			return fmt.Sprintf("{:%s}", pName), nil
		}
		return leftExpr, nil
	}

	opTok := b.tokens[b.pos]
	b.pos++

	if b.pos >= len(b.tokens) {
		return "", fmt.Errorf("missing right operand for operator %s", opTok.Value)
	}

	rightTok := b.tokens[b.pos]
	b.pos++

	rightExpr, rightVal, rightIsCol, err := b.resolveToken(rightTok)
	if err != nil {
		return "", err
	}

	return b.formatComparison(leftExpr, leftVal, isCol, opTok.Value, rightExpr, rightVal, rightIsCol)
}

func (b *sqlBuilder) parseCollectionSubquery() (string, error) {
	leftTok := b.tokens[b.pos]
	if b.opts.Untrusted {
		return "", fmt.Errorf("@collection references are not allowed in filters")
	}
	b.pos++

	if b.pos >= len(b.tokens) || b.tokens[b.pos].Type != TokenOperator {
		return "", fmt.Errorf("expected operator after %s", leftTok.Value)
	}
	opTok := b.tokens[b.pos]
	b.pos++

	if b.pos >= len(b.tokens) {
		return "", fmt.Errorf("missing right operand for @collection condition")
	}
	rightTok := b.tokens[b.pos]
	b.pos++

	cleanLeft := strings.TrimPrefix(leftTok.Value, "@collection.")
	parts := strings.SplitN(cleanLeft, ".", 2)
	if len(parts) != 2 {
		return "", fmt.Errorf("invalid @collection identifier %q", leftTok.Value)
	}
	targetTable := parts[0]
	targetField := parts[1]
	if err := db.ValidateTableName(targetTable); err != nil {
		return "", fmt.Errorf("invalid @collection identifier %q: %w", leftTok.Value, err)
	}
	if !identPattern.MatchString(targetField) {
		return "", fmt.Errorf("invalid @collection identifier %q", leftTok.Value)
	}

	rightExpr, rightVal, rightIsCol, err := b.resolveToken(rightTok)
	if err != nil {
		return "", err
	}

	var rightCond string
	if rightIsCol {
		rightCond = b.qualifiedOuter(rightExpr)
	} else if rightVal != nil {
		pName := b.nextParamName()
		b.params[pName] = rightVal
		rightCond = fmt.Sprintf("{:%s}", pName)
	} else {
		rightCond = rightExpr
	}

	sqlOp := b.mapOperator(opTok.Value)
	if sqlOp == "LIKE" || sqlOp == "NOT LIKE" {
		if !rightIsCol && rightVal != nil {
			pName := b.nextParamName()
			b.params[pName] = "%" + fmt.Sprintf("%v", rightVal) + "%"
			rightCond = fmt.Sprintf("{:%s}", pName)
		}
	}

	alias := b.subAlias()
	subquery := fmt.Sprintf("EXISTS (SELECT 1 FROM %s AS %s WHERE %s.%s %s %s)", db.QuoteIdentifier(targetTable), alias, alias, db.QuoteIdentifier(targetField), sqlOp, rightCond)
	return subquery, nil
}

// qualifiedOuter qualifies a bare column of the builder's own table (its name at the top level,
// its subquery alias inside a nested rule), so it keeps referring to that row inside a deeper
// subquery.
func (b *sqlBuilder) qualifiedOuter(col string) string {
	if !identPattern.MatchString(col) {
		return col
	}
	if b.selfRef != "" {
		return b.selfRef + "." + db.QuoteIdentifier(col)
	}
	if b.moul == nil {
		return col
	}
	return db.QuoteIdentifier(b.moul.Name) + "." + db.QuoteIdentifier(col)
}

func (b *sqlBuilder) isRelationPath(fieldName string) bool {
	if !strings.Contains(fieldName, ".") {
		return false
	}
	parts := strings.Split(fieldName, ".")
	if b.moul == nil {
		return false
	}
	for _, f := range b.moul.Fields {
		if f.Name == parts[0] && f.Type == "relation" && f.RelationConfig != nil {
			return true
		}
	}
	return false
}

func (b *sqlBuilder) parseRelationalComparison() (string, error) {
	leftTok := b.tokens[b.pos]
	b.pos++

	if b.pos >= len(b.tokens) || b.tokens[b.pos].Type != TokenOperator {
		return "", fmt.Errorf("expected operator after relational path %s", leftTok.Value)
	}
	opTok := b.tokens[b.pos]
	b.pos++

	if b.pos >= len(b.tokens) {
		return "", fmt.Errorf("missing right operand for relational path %s", leftTok.Value)
	}
	rightTok := b.tokens[b.pos]
	b.pos++

	rightExpr, rightVal, rightIsCol, err := b.resolveToken(rightTok)
	if err != nil {
		return "", err
	}

	parts := strings.Split(leftTok.Value, ".")
	if len(parts) != 2 || !identPattern.MatchString(parts[1]) {
		return "", fmt.Errorf("invalid relational path %q", leftTok.Value)
	}
	relFieldName := parts[0]
	relField := findRelationField(b.moul, relFieldName)
	if relField == nil {
		return "", fmt.Errorf("invalid relation field %q in path %q", relFieldName, leftTok.Value)
	}

	targetMoul, err := loadTarget(b.opts.LoadMoul, relField.RelationConfig.TargetMoul)
	if err != nil {
		return "", fmt.Errorf("invalid relational path %q: %w", leftTok.Value, err)
	}
	targetField := parts[1]
	if !IsValidField(targetField, targetMoul) {
		return "", fmt.Errorf("invalid field %q in path %q", targetField, leftTok.Value)
	}
	if b.opts.Untrusted && IsSecretField(targetField, targetMoul) {
		return "", fmt.Errorf("filtering by %q is not allowed", leftTok.Value)
	}

	// A client filter only matches target rows the caller may list.
	visibility := ""
	if b.opts.Untrusted {
		if rule := strings.TrimSpace(targetMoul.Rules.ListRule); rule != "" {
			ruleSQL, err := b.nestedRuleSQL(rule, targetMoul)
			if err != nil {
				return "", err
			}
			visibility = fmt.Sprintf(" AND (%s)", ruleSQL)
		}
	}

	alias := b.subAlias()
	target := db.QuoteIdentifier(targetMoul.Name) + " AS " + alias
	targetCol := alias + "." + db.QuoteIdentifier(targetField)
	outerCol := b.qualifiedOuter(relFieldName)

	sqlOp := b.mapOperator(opTok.Value)

	var rightCond string
	if rightIsCol {
		rightCond = b.qualifiedOuter(rightExpr)
	} else if rightVal != nil {
		pName := b.nextParamName()
		if sqlOp == "LIKE" || sqlOp == "NOT LIKE" {
			b.params[pName] = "%" + fmt.Sprintf("%v", rightVal) + "%"
		} else {
			b.params[pName] = rightVal
		}
		rightCond = fmt.Sprintf("{:%s}", pName)
	} else {
		if rightExpr != "" {
			rightCond = rightExpr
		} else {
			nullCheck := "IS NOT NULL"
			if sqlOp == "=" {
				nullCheck = "IS NULL"
			}
			return fmt.Sprintf("EXISTS (SELECT 1 FROM %s WHERE %s.id = %s AND %s %s%s)", target, alias, outerCol, targetCol, nullCheck, visibility), nil
		}
	}

	card := relField.RelationConfig.Cardinality
	if card == "1:1" || card == "1:N" {
		return fmt.Sprintf("EXISTS (SELECT 1 FROM %s WHERE %s.id = %s AND %s %s %s%s)", target, alias, outerCol, targetCol, sqlOp, rightCond, visibility), nil
	} else if card == "M:N" {
		return fmt.Sprintf("EXISTS (SELECT 1 FROM %s JOIN json_each(%s) WHERE %s.id = json_each.value AND %s %s %s%s)", target, outerCol, alias, targetCol, sqlOp, rightCond, visibility), nil
	}

	return "", fmt.Errorf("unsupported relation cardinality %q", card)
}

func (b *sqlBuilder) resolveToken(tok Token) (expr string, val interface{}, isColumn bool, err error) {
	switch tok.Type {
	case TokenNumber:
		if n, err := strconv.ParseInt(tok.Value, 10, 64); err == nil {
			return "", n, false, nil
		}
		if f, err := strconv.ParseFloat(tok.Value, 64); err == nil {
			return "", f, false, nil
		}
		return "", tok.Value, false, nil

	case TokenString:
		return "", tok.Value, false, nil

	case TokenIdentifier:
		vLower := strings.ToLower(tok.Value)

		if vLower == "true" {
			return "", true, false, nil
		}
		if vLower == "false" {
			return "", false, false, nil
		}
		if vLower == "null" {
			return "", nil, false, nil
		}

		// Auth context references: auth.id, @request.auth.id, etc.
		if strings.HasPrefix(tok.Value, "auth.") || strings.HasPrefix(tok.Value, "@request.auth.") || strings.HasPrefix(tok.Value, "@auth.") {
			field := tok.Value
			if idx := strings.LastIndex(field, "."); idx != -1 {
				field = field[idx+1:]
			}
			if b.authRecord != nil {
				if val, ok := b.authRecord[field]; ok && val != nil {
					return "", val, false, nil
				}
			}
			return "", "", false, nil
		}

		// Request query references: @request.query.param
		if strings.HasPrefix(tok.Value, "@request.query.") {
			paramName := strings.TrimPrefix(tok.Value, "@request.query.")
			if qMap, ok := b.reqContext["query"].(map[string]interface{}); ok {
				return "", qMap[paramName], false, nil
			}
			return "", nil, false, nil
		}

		// Request header references: @request.headers.header
		if strings.HasPrefix(tok.Value, "@request.headers.") {
			headerName := strings.TrimPrefix(tok.Value, "@request.headers.")
			if hMap, ok := b.reqContext["headers"].(map[string]interface{}); ok {
				return "", hMap[headerName], false, nil
			}
			return "", nil, false, nil
		}

		// Datetime macros: @now, @todayStart, etc.
		if strings.HasPrefix(tok.Value, "@") {
			macro := strings.TrimPrefix(tok.Value, "@")
			now := time.Now().UTC()
			switch macro {
			case "now":
				return "", now.Format("2006-01-02 15:04:05.000Z"), false, nil
			case "yesterday":
				return "", now.AddDate(0, 0, -1).Format("2006-01-02 15:04:05.000Z"), false, nil
			case "tomorrow":
				return "", now.AddDate(0, 0, 1).Format("2006-01-02 15:04:05.000Z"), false, nil
			case "todayStart":
				return "", time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC).Format("2006-01-02 15:04:05.000Z"), false, nil
			case "todayEnd":
				return "", time.Date(now.Year(), now.Month(), now.Day(), 23, 59, 59, 999000000, time.UTC).Format("2006-01-02 15:04:05.000Z"), false, nil
			case "monthStart":
				firstDayMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
				return "", firstDayMonth.Format("2006-01-02 15:04:05.000Z"), false, nil
			case "monthEnd":
				firstDayMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
				return "", firstDayMonth.AddDate(0, 1, -1).Add(23*time.Hour + 59*time.Minute + 59*time.Second + 999*time.Millisecond).Format("2006-01-02 15:04:05.000Z"), false, nil
			case "yearStart":
				firstDayYear := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, time.UTC)
				return "", firstDayYear.Format("2006-01-02 15:04:05.000Z"), false, nil
			case "yearEnd":
				firstDayYear := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, time.UTC)
				return "", firstDayYear.AddDate(1, 0, -1).Add(23*time.Hour + 59*time.Minute + 59*time.Second + 999*time.Millisecond).Format("2006-01-02 15:04:05.000Z"), false, nil
			}
		}

		// Field modifiers: col:lower, col:length, col:isset
		if strings.Contains(tok.Value, ":") {
			parts := strings.SplitN(tok.Value, ":", 2)
			baseCol := parts[0]
			mod := parts[1]
			if !identPattern.MatchString(baseCol) || !IsValidField(baseCol, b.moul) {
				return "", nil, false, fmt.Errorf("invalid field %q", baseCol)
			}
			if b.opts.Untrusted && IsSecretField(baseCol, b.moul) {
				return "", nil, false, fmt.Errorf("filtering by %q is not allowed", baseCol)
			}
			switch mod {
			case "lower":
				return fmt.Sprintf("LOWER(%s)", baseCol), nil, true, nil
			case "length":
				return fmt.Sprintf("LENGTH(%s)", baseCol), nil, true, nil
			case "isset":
				return fmt.Sprintf("(%s IS NOT NULL)", baseCol), nil, false, nil
			}
		}

		// Validate column name
		if identPattern.MatchString(tok.Value) && IsValidField(tok.Value, b.moul) {
			if b.opts.Untrusted && IsSecretField(tok.Value, b.moul) {
				return "", nil, false, fmt.Errorf("filtering by %q is not allowed", tok.Value)
			}
			return tok.Value, nil, true, nil
		}

		return "", nil, false, fmt.Errorf("invalid field %q", tok.Value)
	}

	return "", nil, false, fmt.Errorf("unexpected token %q", tok.Value)
}

func (b *sqlBuilder) mapOperator(op string) string {
	switch op {
	case "=", "==", "?=":
		return "="
	case "!=", "?!=":
		return "!="
	case "~", "?~":
		return "LIKE"
	case "!~", "?!~":
		return "NOT LIKE"
	case ">", "?>":
		return ">"
	case ">=", "?>=":
		return ">="
	case "<", "?<":
		return "<"
	case "<=", "?<=":
		return "<="
	default:
		return op
	}
}

func (b *sqlBuilder) getCloakField(colName string) *schema.MoulField {
	if b.moul == nil {
		return nil
	}
	for _, f := range b.moul.Fields {
		if strings.EqualFold(f.Name, colName) && f.Type == "cloak" {
			return &f
		}
	}
	return nil
}

func (b *sqlBuilder) formatComparison(
	leftExpr string, leftVal interface{}, leftIsCol bool,
	op string,
	rightExpr string, rightVal interface{}, rightIsCol bool,
) (string, error) {
	sqlOp := b.mapOperator(op)

	// Check cloak field restrictions
	var cloakF *schema.MoulField
	var targetVal interface{}
	var isLeftCol bool
	if leftIsCol {
		cloakF = b.getCloakField(leftExpr)
		targetVal = rightVal
		isLeftCol = true
	} else if rightIsCol {
		cloakF = b.getCloakField(rightExpr)
		targetVal = leftVal
		isLeftCol = false
	}

	if cloakF != nil {
		if !cloakF.Searchable {
			return "", fmt.Errorf("cloak field %q is not searchable", cloakF.Name)
		}
		if sqlOp != "=" && sqlOp != "!=" {
			return "", fmt.Errorf("cloak field %q only supports '=' and '!=' operators", cloakF.Name)
		}

		hashColName := db.QuoteIdentifier(cloakF.Name + "Hash")

		// Handle null checks on cloak field
		if targetVal == nil {
			if sqlOp == "=" {
				return fmt.Sprintf("%s IS NULL", hashColName), nil
			}
			return fmt.Sprintf("%s IS NOT NULL", hashColName), nil
		}

		// Calculate HMAC blind index hash for search
		hashVal := cloak.ComputeHash(fmt.Sprintf("%v", targetVal))
		pName := b.nextParamName()
		b.params[pName] = hashVal
		if isLeftCol {
			return fmt.Sprintf("%s %s {:%s}", hashColName, sqlOp, pName), nil
		}
		return fmt.Sprintf("{:%s} %s %s", pName, sqlOp, hashColName), nil
	}

	// Null checks
	if rightVal == nil && !rightIsCol && rightExpr == "" {
		if sqlOp == "=" {
			if leftIsCol {
				return fmt.Sprintf("%s IS NULL", leftExpr), nil
			}
			pName := b.nextParamName()
			b.params[pName] = leftVal
			return fmt.Sprintf("{:%s} IS NULL", pName), nil
		}
		if sqlOp == "!=" {
			if leftIsCol {
				return fmt.Sprintf("%s IS NOT NULL", leftExpr), nil
			}
			pName := b.nextParamName()
			b.params[pName] = leftVal
			return fmt.Sprintf("{:%s} IS NOT NULL", pName), nil
		}
	}
	if leftVal == nil && !leftIsCol && leftExpr == "" {
		if sqlOp == "=" {
			if rightIsCol {
				return fmt.Sprintf("%s IS NULL", rightExpr), nil
			}
			pName := b.nextParamName()
			b.params[pName] = rightVal
			return fmt.Sprintf("{:%s} IS NULL", pName), nil
		}
		if sqlOp == "!=" {
			if rightIsCol {
				return fmt.Sprintf("%s IS NOT NULL", rightExpr), nil
			}
			pName := b.nextParamName()
			b.params[pName] = rightVal
			return fmt.Sprintf("{:%s} IS NOT NULL", pName), nil
		}
	}

	// Prepare left operand SQL
	var leftCond string
	if leftIsCol {
		leftCond = leftExpr
	} else if leftVal != nil {
		pName := b.nextParamName()
		b.params[pName] = leftVal
		leftCond = fmt.Sprintf("{:%s}", pName)
	} else {
		leftCond = leftExpr
	}

	// Prepare right operand SQL
	var rightCond string
	if rightIsCol {
		rightCond = rightExpr
	} else if rightVal != nil {
		if sqlOp == "LIKE" || sqlOp == "NOT LIKE" {
			pName := b.nextParamName()
			b.params[pName] = "%" + fmt.Sprintf("%v", rightVal) + "%"
			rightCond = fmt.Sprintf("{:%s}", pName)
		} else {
			pName := b.nextParamName()
			b.params[pName] = rightVal
			rightCond = fmt.Sprintf("{:%s}", pName)
		}
	} else {
		rightCond = rightExpr
	}

	return fmt.Sprintf("%s %s %s", leftCond, sqlOp, rightCond), nil
}

// OwnerFields returns the columns a rule pins to the caller: every direct comparison
// "<column> = @request.auth.id" (or auth.id / @auth.id, in either order). A non-admin write may
// only set such a column to the caller's own id.
func OwnerFields(rule string) []string {
	tokens, err := Tokenize(rule)
	if err != nil {
		return nil
	}
	isAuthID := func(t Token) bool {
		return t.Type == TokenIdentifier && (t.Value == "@request.auth.id" || t.Value == "auth.id" || t.Value == "@auth.id")
	}
	isColumn := func(t Token) bool {
		return t.Type == TokenIdentifier && identPattern.MatchString(t.Value) && !strings.EqualFold(t.Value, "id") &&
			!strings.EqualFold(t.Value, "true") && !strings.EqualFold(t.Value, "false") && !strings.EqualFold(t.Value, "null")
	}
	seen := map[string]bool{}
	var fields []string
	for i := 0; i+2 < len(tokens); i++ {
		op := tokens[i+1]
		if op.Type != TokenOperator || (op.Value != "=" && op.Value != "==") {
			continue
		}
		left, right := tokens[i], tokens[i+2]
		var col string
		switch {
		case isColumn(left) && isAuthID(right):
			col = left.Value
		case isAuthID(left) && isColumn(right):
			col = right.Value
		default:
			continue
		}
		if !seen[col] {
			seen[col] = true
			fields = append(fields, col)
		}
	}
	return fields
}
