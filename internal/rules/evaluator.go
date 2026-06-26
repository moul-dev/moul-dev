package rules

import (
	"fmt"

	"github.com/expr-lang/expr"
)

// EvaluateRule evaluates a boolean rule expression against the auth context and record data.
// The expression environment is restricted to only auth and record fields to prevent
// access to dangerous built-in functions.
func EvaluateRule(ruleStr string, authRecord map[string]interface{}, recordData map[string]interface{}) (bool, error) {
	if ruleStr == "" {
		return true, nil // Empty rule means public access (anyone can access)
	}

	// Prepare the environment
	env := make(map[string]interface{})

	// Add record fields to environment
	for k, v := range recordData {
		env[k] = v
	}

	// Add auth context
	if authRecord != nil {
		env["auth"] = authRecord
	} else {
		// Provide an empty/null structure so referencing auth.id doesn't panic
		env["auth"] = map[string]interface{}{
			"id":       nil,
			"username": nil,
			"email":    nil,
		}
	}

	// Compile the expression with safety restrictions:
	// - AsBool: enforce boolean output at compile time
	// - AllowUndefinedVariables: prevent panics on missing fields
	// - DisableAllBuiltins: remove access to potentially dangerous built-in functions
	program, err := expr.Compile(ruleStr,
		expr.Env(env),
		expr.AsBool(),
		expr.AllowUndefinedVariables(),
		expr.DisableAllBuiltins(),
	)
	if err != nil {
		return false, fmt.Errorf("failed to compile rule '%s': %w", ruleStr, err)
	}

	// Run the expression
	output, err := expr.Run(program, env)
	if err != nil {
		return false, fmt.Errorf("failed to execute rule '%s': %w", ruleStr, err)
	}

	// Expect boolean output (guaranteed by AsBool() at compile time)
	allowed, ok := output.(bool)
	if !ok {
		return false, fmt.Errorf("rule did not evaluate to a boolean (got %T)", output)
	}

	return allowed, nil
}
