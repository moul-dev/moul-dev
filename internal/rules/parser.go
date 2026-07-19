package rules

import (
	"fmt"
	"strings"
)

type TokenType int

const (
	TokenEOF TokenType = iota
	TokenIdentifier
	TokenOperator
	TokenString
	TokenNumber
	TokenParen
	TokenLogical
	TokenComma
)

type Token struct {
	Type  TokenType
	Value string
}

type CollectionCondition struct {
	Field    string
	Operator string
	Value    string
	IsValId  bool
}

type CollectionGroup struct {
	Table      string
	Alias      string
	Conditions []CollectionCondition
}

func isWhitespace(r rune) bool {
	return r == ' ' || r == '\t' || r == '\n' || r == '\r'
}

func isDigit(r rune) bool {
	return r >= '0' && r <= '9'
}

func isIdentifierStart(r rune) bool {
	return (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || r == '_' || r == '@'
}

func isIdentifierChar(r rune) bool {
	return (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '_' || r == '.' || r == ':' || r == '-' || r == '@'
}

// Tokenize converts a PocketBase rules string into a slice of Tokens.
func Tokenize(ruleStr string) ([]Token, error) {
	var tokens []Token
	runes := []rune(ruleStr)
	n := len(runes)
	i := 0

	for i < n {
		r := runes[i]
		if isWhitespace(r) {
			i++
			continue
		}

		// Comment support
		if r == '/' && i+1 < n && runes[i+1] == '/' {
			i += 2
			for i < n && runes[i] != '\n' && runes[i] != '\r' {
				i++
			}
			continue
		}

		// Parens
		if r == '(' || r == ')' {
			tokens = append(tokens, Token{Type: TokenParen, Value: string(r)})
			i++
			continue
		}

		// Comma
		if r == ',' {
			tokens = append(tokens, Token{Type: TokenComma, Value: string(r)})
			i++
			continue
		}

		// String literals
		if r == '\'' || r == '"' {
			quote := r
			start := i
			i++
			var val []rune
			for i < n && runes[i] != quote {
				if runes[i] == '\\' && i+1 < n {
					val = append(val, runes[i+1])
					i += 2
				} else {
					val = append(val, runes[i])
					i++
				}
			}
			if i >= n {
				return nil, fmt.Errorf("unterminated string literal starting at position %d", start)
			}
			i++ // consume closing quote
			tokens = append(tokens, Token{Type: TokenString, Value: string(val)})
			continue
		}

		// Operators (longest match first)
		if i+3 <= n {
			three := string(runes[i : i+3])
			if three == "?!=" || three == "?!~" || three == "?>=" || three == "?<=" {
				tokens = append(tokens, Token{Type: TokenOperator, Value: three})
				i += 3
				continue
			}
		}
		if i+2 <= n {
			two := string(runes[i : i+2])
			if two == "?=" || two == "?~" || two == "?>" || two == "?<" || two == "!=" || two == "==" || two == ">=" || two == "<=" || two == "!~" || two == "&&" || two == "||" {
				if two == "&&" || two == "||" {
					tokens = append(tokens, Token{Type: TokenLogical, Value: two})
				} else {
					tokens = append(tokens, Token{Type: TokenOperator, Value: two})
				}
				i += 2
				continue
			}
		}
		if r == '=' || r == '~' || r == '>' || r == '<' {
			tokens = append(tokens, Token{Type: TokenOperator, Value: string(r)})
			i++
			continue
		}

		// Numbers
		if isDigit(r) || (r == '-' && i+1 < n && isDigit(runes[i+1])) {
			start := i
			if r == '-' {
				i++
			}
			for i < n && (isDigit(runes[i]) || runes[i] == '.') {
				i++
			}
			tokens = append(tokens, Token{Type: TokenNumber, Value: string(runes[start:i])})
			continue
		}

		// Identifiers
		if isIdentifierStart(r) {
			start := i
			for i < n && isIdentifierChar(runes[i]) {
				i++
			}
			val := string(runes[start:i])
			lowerVal := strings.ToLower(val)
			if lowerVal == "and" || lowerVal == "or" {
				tokens = append(tokens, Token{Type: TokenLogical, Value: val})
			} else {
				tokens = append(tokens, Token{Type: TokenIdentifier, Value: val})
			}
			continue
		}

		return nil, fmt.Errorf("unexpected character %q at position %d", r, i)
	}

	return tokens, nil
}

// processCollectionFilters identifies `@collection` checks, extracts them into groups, and replaces them with placeholder variables.
func processCollectionFilters(tokens []Token) ([]Token, map[string]*CollectionGroup, error) {
	groups := make(map[string]*CollectionGroup)
	var newTokens []Token
	n := len(tokens)
	i := 0

	for i < n {
		if i+2 < n && tokens[i].Type == TokenIdentifier && strings.HasPrefix(tokens[i].Value, "@collection.") && tokens[i+1].Type == TokenOperator {
			left := tokens[i].Value
			op := tokens[i+1].Value
			rightTok := tokens[i+2]
			if rightTok.Type == TokenIdentifier || rightTok.Type == TokenString || rightTok.Type == TokenNumber {
				cleanLeft := strings.TrimPrefix(left, "@collection.")
				parts := strings.SplitN(cleanLeft, ".", 2)
				if len(parts) != 2 {
					return nil, nil, fmt.Errorf("invalid @collection identifier: %s", left)
				}
				tableOrAlias := parts[0]
				field := parts[1]

				table := tableOrAlias
				alias := ""
				if idx := strings.Index(tableOrAlias, ":"); idx != -1 {
					table = tableOrAlias[:idx]
					alias = tableOrAlias[idx+1:]
				}

				val := rightTok.Value
				isId := false
				if rightTok.Type == TokenIdentifier {
					isId = true
					if strings.HasPrefix(val, "@") {
						val = strings.TrimPrefix(val, "@")
					}
				}

				cond := CollectionCondition{
					Field:    field,
					Operator: op,
					Value:    val,
					IsValId:  isId,
				}

				groupKey := tableOrAlias
				g, exists := groups[groupKey]
				if !exists {
					g = &CollectionGroup{
						Table: table,
						Alias: alias,
					}
					groups[groupKey] = g
				}
				g.Conditions = append(g.Conditions, cond)

				safeKey := strings.ReplaceAll(groupKey, ":", "_")
				placeholder := "exists_group_" + safeKey
				
				isFirst := len(g.Conditions) == 1
				if isFirst {
					newTokens = append(newTokens, Token{Type: TokenIdentifier, Value: placeholder})
				} else {
					newTokens = append(newTokens, Token{Type: TokenIdentifier, Value: "true"})
				}

				i += 3
				continue
			}
		}

		newTokens = append(newTokens, tokens[i])
		i++
	}

	return newTokens, groups, nil
}

// Translate translates a PocketBase rules string into a Go `expr` string and returns any grouped `@collection` checks.
func Translate(ruleStr string) (string, map[string]*CollectionGroup, error) {
	if ruleStr == "" {
		return "", nil, nil
	}
	tokens, err := Tokenize(ruleStr)
	if err != nil {
		return "", nil, err
	}

	processedTokens, groups, err := processCollectionFilters(tokens)
	if err != nil {
		return "", nil, err
	}

	translated, err := translateTokens(processedTokens)
	if err != nil {
		return "", nil, err
	}

	return translated, groups, nil
}

func translateTokens(tokens []Token) (string, error) {
	var sb strings.Builder
	n := len(tokens)
	i := 0

	for i < n {
		tok := tokens[i]

		// Check for :each modifier sequence
		if i+2 < n && tok.Type == TokenIdentifier && strings.HasSuffix(tok.Value, ":each") && tokens[i+1].Type == TokenOperator {
			baseIdent := strings.TrimSuffix(tok.Value, ":each")
			if strings.HasPrefix(baseIdent, "@") {
				baseIdent = strings.TrimPrefix(baseIdent, "@")
			}
			op := tokens[i+1].Value
			valTok := tokens[i+2]

			var fnName string
			switch op {
			case "=", "==":
				fnName = "all_eq"
			case "!=":
				fnName = "all_neq"
			case "~":
				fnName = "all_like"
			case "!~":
				fnName = "all_not_like"
			case ">":
				fnName = "all_gt"
			case ">=":
				fnName = "all_gte"
			case "<":
				fnName = "all_lt"
			case "<=":
				fnName = "all_lte"
			default:
				return "", fmt.Errorf("unsupported operator %s with :each modifier", op)
			}

			valStr := valTok.Value
			if valTok.Type == TokenString {
				valStr = fmt.Sprintf("%q", valStr)
			}

			sb.WriteString(fmt.Sprintf("%s(%s, %s)", fnName, baseIdent, valStr))
			i += 3
			continue
		}

		// Wildcard operators (?=, ?~, etc.)
		if i+2 < n && tokens[i+1].Type == TokenOperator && strings.HasPrefix(tokens[i+1].Value, "?") {
			leftVal := tok.Value
			if tok.Type == TokenIdentifier && strings.HasPrefix(leftVal, "@") {
				leftVal = strings.TrimPrefix(leftVal, "@")
			} else if tok.Type == TokenString {
				leftVal = fmt.Sprintf("%q", leftVal)
			}

			op := tokens[i+1].Value
			rightTok := tokens[i+2]
			rightVal := rightTok.Value
			if rightTok.Type == TokenIdentifier && strings.HasPrefix(rightVal, "@") {
				rightVal = strings.TrimPrefix(rightVal, "@")
			} else if rightTok.Type == TokenString {
				rightVal = fmt.Sprintf("%q", rightVal)
			}

			var fnName string
			switch op {
			case "?=":
				fnName = "any_eq"
			case "?!=":
				fnName = "any_neq"
			case "?~":
				fnName = "any_like"
			case "?!~":
				fnName = "any_not_like"
			case "?>":
				fnName = "any_gt"
			case "?>=":
				fnName = "any_gte"
			case "?<":
				fnName = "any_lt"
			case "?<=":
				fnName = "any_lte"
			default:
				return "", fmt.Errorf("unsupported wildcard operator %s", op)
			}

			sb.WriteString(fmt.Sprintf("%s(%s, %s)", fnName, leftVal, rightVal))
			i += 3
			continue
		}

		// Lookahead for normal ~ and !~ operators
		if i+2 < n && (tokens[i+1].Value == "~" || tokens[i+1].Value == "!~") {
			leftVal := tok.Value
			if tok.Type == TokenIdentifier && strings.HasPrefix(leftVal, "@") {
				leftVal = strings.TrimPrefix(leftVal, "@")
			} else if tok.Type == TokenString {
				leftVal = fmt.Sprintf("%q", leftVal)
			}

			op := tokens[i+1].Value
			rightTok := tokens[i+2]
			rightVal := rightTok.Value
			if rightTok.Type == TokenIdentifier && strings.HasPrefix(rightVal, "@") {
				rightVal = strings.TrimPrefix(rightVal, "@")
			} else if rightTok.Type == TokenString {
				rightVal = fmt.Sprintf("%q", rightVal)
			}

			if op == "~" {
				sb.WriteString(fmt.Sprintf("like(%s, %s)", leftVal, rightVal))
			} else {
				sb.WriteString(fmt.Sprintf("!like(%s, %s)", leftVal, rightVal))
			}
			i += 3
			continue
		}

		// Normal operators
		if tok.Type == TokenOperator {
			val := tok.Value
			if val == "=" {
				val = "=="
			}
			sb.WriteString(" " + val + " ")
			i++
			continue
		}

		// Normal tokens
		switch tok.Type {
		case TokenIdentifier:
			val := tok.Value
			if strings.HasPrefix(val, "@") {
				val = strings.TrimPrefix(val, "@")
			}

			// Handle modifiers: :lower, :length, :isset, :changed
			if strings.Contains(val, ":") {
				parts := strings.Split(val, ":")
				base := parts[0]
				if strings.HasPrefix(base, "@") {
					base = strings.TrimPrefix(base, "@")
				}
				mod := parts[1]

				switch mod {
				case "lower":
					sb.WriteString(fmt.Sprintf("lower(%s)", base))
				case "length":
					sb.WriteString(fmt.Sprintf("length(%s)", base))
				case "isset":
					lastDot := strings.LastIndex(base, ".")
					if lastDot == -1 {
						return "", fmt.Errorf("invalid path for :isset modifier: %s", val)
					}
					parent := base[:lastDot]
					key := base[lastDot+1:]
					sb.WriteString(fmt.Sprintf("isset(%s, %q)", parent, key))
				case "changed":
					lastDot := strings.LastIndex(base, ".")
					if lastDot == -1 {
						return "", fmt.Errorf("invalid path for :changed modifier: %s", val)
					}
					key := base[lastDot+1:]
					sb.WriteString(fmt.Sprintf("changed(_record, %q, request.body)", key))
				default:
					return "", fmt.Errorf("unsupported modifier :%s", mod)
				}
			} else {
				// Handle datetime macros
				if strings.HasPrefix(tok.Value, "@") {
					macro := strings.TrimPrefix(tok.Value, "@")
					switch macro {
					case "now", "yesterday", "tomorrow", "todayStart", "todayEnd", "monthStart", "monthEnd", "yearStart", "yearEnd":
						sb.WriteString("_" + macro)
					default:
						sb.WriteString(val)
					}
				} else {
					sb.WriteString(val)
				}
			}

		case TokenString:
			sb.WriteString(fmt.Sprintf("%q", tok.Value))

		case TokenLogical:
			val := strings.ToLower(tok.Value)
			if val == "and" {
				val = "&&"
			} else if val == "or" {
				val = "||"
			}
			sb.WriteString(" " + val + " ")

		default:
			sb.WriteString(tok.Value)
		}
		i++
	}

	return sb.String(), nil
}
