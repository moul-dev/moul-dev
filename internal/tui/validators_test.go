package tui

import (
	"testing"
)

func TestValidateEmail(t *testing.T) {
	validEmails := []string{
		"admin@moul.dev",
		"user.name+tag@example.co.uk",
		"test_123@domain.org",
	}
	for _, e := range validEmails {
		if err := ValidateEmail(e); err != nil {
			t.Errorf("expected email %q to be valid, got: %v", e, err)
		}
	}

	invalidEmails := []string{
		"",
		"   ",
		"invalidemail",
		"user@",
		"@domain.com",
		"user@domain",
	}
	for _, e := range invalidEmails {
		if err := ValidateEmail(e); err == nil {
			t.Errorf("expected email %q to be invalid, but got nil error", e)
		}
	}
}

func TestValidatePassword(t *testing.T) {
	if err := ValidatePassword("12345678"); err != nil {
		t.Errorf("expected password to be valid, got: %v", err)
	}
	if err := ValidatePassword("short"); err == nil {
		t.Errorf("expected short password to fail validation")
	}
}

func TestValidateConfirmPassword(t *testing.T) {
	pass := "secret123"
	fn := ValidateConfirmPassword(&pass)

	if err := fn("secret123"); err != nil {
		t.Errorf("expected passwords to match, got: %v", err)
	}
	if err := fn("different"); err == nil {
		t.Errorf("expected mismatched passwords to fail")
	}
}

func TestValidateUsername(t *testing.T) {
	if err := ValidateUsername("admin_123"); err != nil {
		t.Errorf("expected valid username, got: %v", err)
	}
	if err := ValidateUsername("ab"); err == nil {
		t.Errorf("expected username < 3 chars to fail")
	}
	if err := ValidateUsername("user@name"); err == nil {
		t.Errorf("expected username with special char to fail")
	}
}

func TestValidateURL(t *testing.T) {
	if err := ValidateURL("http://localhost:8090"); err != nil {
		t.Errorf("expected valid URL, got: %v", err)
	}
	if err := ValidateURL("ftp://localhost"); err == nil {
		t.Errorf("expected ftp scheme to fail")
	}
}

func TestValidateNumber(t *testing.T) {
	if err := ValidateNumber("123.45"); err != nil {
		t.Errorf("expected valid number, got: %v", err)
	}
	if err := ValidateNumber("abc"); err == nil {
		t.Errorf("expected invalid number to fail")
	}
	if err := ValidateNumber(""); err != nil {
		t.Errorf("expected empty string to be valid optional number")
	}
}

func TestValidateJSON(t *testing.T) {
	if err := ValidateJSON(`{"key": "val"}`); err != nil {
		t.Errorf("expected valid JSON, got: %v", err)
	}
	if err := ValidateJSON(`{invalid}`); err == nil {
		t.Errorf("expected invalid JSON to fail")
	}
}

func TestValidateNumberRange(t *testing.T) {
	fn := ValidateNumberRange(0, 100)
	if err := fn("50"); err != nil {
		t.Errorf("expected 50 to be within range, got: %v", err)
	}
	if err := fn("150"); err == nil {
		t.Errorf("expected 150 to be out of range")
	}
}
