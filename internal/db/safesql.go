package db

import (
	"fmt"
	"regexp"
	"strings"
)

// tableNamePattern enforces safe identifiers: starts with a letter, followed by
// up to 62 alphanumeric characters or underscores.
var tableNamePattern = regexp.MustCompile(`^[a-zA-Z][a-zA-Z0-9_]{0,62}$`)

// ValidateTableName ensures a table name is safe for use in SQL statements.
// It rejects names that don't match the allowlist pattern.
func ValidateTableName(name string) error {
	if !tableNamePattern.MatchString(name) {
		return fmt.Errorf("invalid table name %q: must start with a letter and contain only letters, digits, or underscores (max 63 chars)", name)
	}
	return nil
}

// QuoteIdentifier wraps a SQL identifier in backticks and escapes any
// embedded backticks to prevent SQL injection.
func QuoteIdentifier(name string) string {
	escaped := strings.ReplaceAll(name, "`", "``")
	return "`" + escaped + "`"
}
