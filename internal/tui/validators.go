package tui

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/moul-dev/moul-dev/internal/auth"
)

var (
	emailRegex    = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
)

// ValidateEmail validates that string is a non-empty, valid email address format.
func ValidateEmail(str string) error {
	trimmed := strings.TrimSpace(str)
	if trimmed == "" {
		return fmt.Errorf("email is required")
	}
	if !emailRegex.MatchString(trimmed) {
		return fmt.Errorf("invalid email format (e.g. user@example.com)")
	}
	return nil
}

// ValidatePassword validates password length and complexity requirements (min 8 chars, 1 uppercase, 1 lowercase, 1 digit).
func ValidatePassword(str string) error {
	return auth.ValidatePassword(str)
}

// ValidateConfirmPassword returns a validator function that checks if password confirmation matches the target password.
func ValidateConfirmPassword(targetPassPtr *string) func(string) error {
	return func(str string) error {
		if targetPassPtr == nil || str != *targetPassPtr {
			return fmt.Errorf("passwords do not match")
		}
		return nil
	}
}

// ValidateUsername validates username format and minimum length.
func ValidateUsername(str string) error {
	trimmed := strings.TrimSpace(str)
	if trimmed == "" {
		return fmt.Errorf("username is required")
	}
	if len(trimmed) < 3 {
		return fmt.Errorf("username must be at least 3 characters long")
	}
	if !usernameRegex.MatchString(trimmed) {
		return fmt.Errorf("username can only contain letters, numbers, underscores, and hyphens")
	}
	return nil
}

// ValidateURL validates that string is a valid URL starting with http:// or https://.
func ValidateURL(str string) error {
	trimmed := strings.TrimSpace(str)
	if trimmed == "" {
		return fmt.Errorf("URL is required")
	}
	if !strings.HasPrefix(trimmed, "http://") && !strings.HasPrefix(trimmed, "https://") {
		return fmt.Errorf("URL must start with http:// or https://")
	}
	return nil
}

// ValidateNumber validates that non-empty string is a valid float/integer.
func ValidateNumber(str string) error {
	trimmed := strings.TrimSpace(str)
	if trimmed == "" {
		return nil
	}
	if _, err := strconv.ParseFloat(trimmed, 64); err != nil {
		return fmt.Errorf("must be a valid numeric value")
	}
	return nil
}

// ValidateJSON validates that non-empty string is valid JSON.
func ValidateJSON(str string) error {
	trimmed := strings.TrimSpace(str)
	if trimmed == "" {
		return nil
	}
	if !json.Valid([]byte(trimmed)) {
		return fmt.Errorf("invalid JSON format")
	}
	return nil
}

// ValidateRequired returns a validator checking that a field is not empty.
func ValidateRequired(fieldName string) func(string) error {
	return func(str string) error {
		if strings.TrimSpace(str) == "" {
			return fmt.Errorf("%s is required", fieldName)
		}
		return nil
	}
}

// ValidateNumberRange returns a validator for numeric values within [min, max].
func ValidateNumberRange(minVal, maxVal float64) func(string) error {
	return func(str string) error {
		trimmed := strings.TrimSpace(str)
		if trimmed == "" {
			return nil
		}
		val, err := strconv.ParseFloat(trimmed, 64)
		if err != nil {
			return fmt.Errorf("must be a valid number between %g and %g", minVal, maxVal)
		}
		if val < minVal || val > maxVal {
			return fmt.Errorf("must be between %g and %g", minVal, maxVal)
		}
		return nil
	}
}
