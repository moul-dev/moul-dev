package rules

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

// Standard system fields present across auth, worker, analytic, or base tables.
var standardFields = map[string]bool{
	"id":                     true,
	"created":                true,
	"updated":                true,
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

// BuildSortSQL converts a comma-separated sort string (e.g. "-created,title", "@random", "-author.name")
// into sanitized SQL ORDER BY expressions.
func BuildSortSQL(sortStr string, moul *schema.Moul) ([]string, error) {
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

		if !IsValidField(fieldName, moul) {
			return nil, fmt.Errorf("invalid sort field %q", fieldName)
		}

		if strings.Contains(fieldName, ".") && moul != nil {
			relParts := strings.Split(fieldName, ".")
			var targetField *schema.MoulField
			for _, f := range moul.Fields {
				if f.Name == relParts[0] && f.Type == "relation" && f.RelationConfig != nil {
					tf := f
					targetField = &tf
					break
				}
			}
			if targetField != nil {
				targetMoul := targetField.RelationConfig.TargetMoul
				card := targetField.RelationConfig.Cardinality
				subCol := relParts[1]
				if card == "1:1" || card == "1:N" {
					result = append(result, fmt.Sprintf("(SELECT %s FROM %s WHERE %s.id = %s) %s", subCol, targetMoul, targetMoul, relParts[0], direction))
				} else if card == "M:N" {
					result = append(result, fmt.Sprintf("(SELECT %s FROM %s JOIN json_each(%s) WHERE %s.id = json_each.value LIMIT 1) %s", subCol, targetMoul, relParts[0], targetMoul, direction))
				}
				continue
			}
		}

		result = append(result, fmt.Sprintf("%s %s", fieldName, direction))
	}

	return result, nil
}

type sqlBuilder struct {
	tokens       []Token
	pos          int
	moul         *schema.Moul
	authRecord   map[string]interface{}
	reqContext   map[string]interface{}
	paramCounter int
	params       dbx.Params
}

func newSQLBuilder(tokens []Token, moul *schema.Moul, authRecord map[string]interface{}, reqContext map[string]interface{}) *sqlBuilder {
	reqMap := map[string]interface{}{
		"query":   map[string]interface{}{},
		"headers": map[string]interface{}{},
	}
	if reqContext != nil {
		for k, v := range reqContext {
			reqMap[k] = v
		}
	}
	return &sqlBuilder{
		tokens:     tokens,
		moul:       moul,
		authRecord: authRecord,
		reqContext: reqMap,
		params:     make(dbx.Params),
	}
}

func (b *sqlBuilder) nextParamName() string {
	b.paramCounter++
	return fmt.Sprintf("p%d", b.paramCounter)
}

// BuildFilterSQL parses a filter string into a parameterized SQL WHERE expression and dbx.Params map.
func BuildFilterSQL(
	filterStr string,
	moul *schema.Moul,
	authRecord map[string]interface{},
	requestContext ...map[string]interface{},
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

	var reqCtx map[string]interface{}
	if len(requestContext) > 0 {
		reqCtx = requestContext[0]
	}

	builder := newSQLBuilder(tokens, moul, authRecord, reqCtx)
	sqlWhere, err := builder.parseLogicalOr()
	if err != nil {
		return "", nil, err
	}

	if builder.pos < len(builder.tokens) {
		return "", nil, fmt.Errorf("unexpected token %q at position %d", builder.tokens[builder.pos].Value, builder.pos)
	}

	return sqlWhere, builder.params, nil
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

	rightExpr, rightVal, rightIsCol, err := b.resolveToken(rightTok)
	if err != nil {
		return "", err
	}

	var rightCond string
	if rightIsCol {
		rightCond = rightExpr
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

	subquery := fmt.Sprintf("EXISTS (SELECT 1 FROM %s WHERE %s.%s %s %s)", targetTable, targetTable, targetField, sqlOp, rightCond)
	return subquery, nil
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
	relFieldName := parts[0]

	var relField *schema.MoulField
	if b.moul != nil {
		for _, f := range b.moul.Fields {
			if f.Name == relFieldName && f.Type == "relation" && f.RelationConfig != nil {
				tf := f
				relField = &tf
				break
			}
		}
	}
	if relField == nil {
		return "", fmt.Errorf("invalid relation field %q in path %q", relFieldName, leftTok.Value)
	}

	targetMoul := relField.RelationConfig.TargetMoul
	card := relField.RelationConfig.Cardinality
	targetField := strings.Join(parts[1:], ".")

	sqlOp := b.mapOperator(opTok.Value)

	var rightCond string
	if rightIsCol {
		rightCond = rightExpr
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
			if sqlOp == "=" {
				return fmt.Sprintf("EXISTS (SELECT 1 FROM %s WHERE %s.id = %s AND %s.%s IS NULL)", targetMoul, targetMoul, relFieldName, targetMoul, targetField), nil
			}
			return fmt.Sprintf("EXISTS (SELECT 1 FROM %s WHERE %s.id = %s AND %s.%s IS NOT NULL)", targetMoul, targetMoul, relFieldName, targetMoul, targetField), nil
		}
	}

	if card == "1:1" || card == "1:N" {
		return fmt.Sprintf("EXISTS (SELECT 1 FROM %s WHERE %s.id = %s AND %s.%s %s %s)", targetMoul, targetMoul, relFieldName, targetMoul, targetField, sqlOp, rightCond), nil
	} else if card == "M:N" {
		return fmt.Sprintf("EXISTS (SELECT 1 FROM %s JOIN json_each(%s) WHERE %s.id = json_each.value AND %s.%s %s %s)", targetMoul, relFieldName, targetMoul, targetMoul, targetField, sqlOp, rightCond), nil
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
				return "", b.authRecord[field], false, nil
			}
			return "", nil, false, nil
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
			if !IsValidField(baseCol, b.moul) {
				return "", nil, false, fmt.Errorf("invalid field %q", baseCol)
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
		if IsValidField(tok.Value, b.moul) {
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

func (b *sqlBuilder) formatComparison(
	leftExpr string, leftVal interface{}, leftIsCol bool,
	op string,
	rightExpr string, rightVal interface{}, rightIsCol bool,
) (string, error) {
	sqlOp := b.mapOperator(op)

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
