package tui

import (
	"testing"

	"github.com/moul-dev/moul-dev/internal/schema"
)

func TestInitEmailTemplateForm(t *testing.T) {
	templates := &schema.EmailTemplates{
		Verification: schema.EmailTemplate{
			Subject: "Verify Email Subject",
			Body:    "Verify Email Body",
		},
		PasswordReset: schema.EmailTemplate{
			Subject: "Reset Password Subject",
			Body:    "Reset Password Body",
		},
		ConfirmEmailChange: schema.EmailTemplate{
			Subject: "Confirm Email Subject",
			Body:    "Confirm Email Body",
		},
		OTP: schema.EmailTemplate{
			Subject: "OTP Subject",
			Body:    "OTP Body",
		},
		LoginAlert: schema.EmailTemplate{
			Subject: "Login Alert Subject",
			Body:    "Login Alert Body",
		},
	}

	m := &Model{
		Mouls: []schema.Moul{
			{Name: "users", Type: "auth"},
		},
		ActiveSidebarIndex: 0,
		emailTemplates:        templates,
		selectedTemplateIndex: 1, // Password Reset
	}

	m.initEmailTemplateForm()

	if m.tempSubject != "Reset Password Subject" {
		t.Errorf("Expected tempSubject 'Reset Password Subject', got %q", m.tempSubject)
	}
	if m.tempBody != "Reset Password Body" {
		t.Errorf("Expected tempBody 'Reset Password Body', got %q", m.tempBody)
	}
	if m.EmailTemplateForm == nil {
		t.Fatalf("Expected EmailTemplateForm to be initialized, got nil")
	}

	// Verify we can update fields in form
	m.tempSubject = "New Subject"
	m.tempBody = "New Body"
	
	// Test save updates template object
	m.saveEmailTemplateForm()
	if m.emailTemplates.PasswordReset.Subject != "New Subject" {
		t.Errorf("Expected updated template subject 'New Subject', got %q", m.emailTemplates.PasswordReset.Subject)
	}
	if m.emailTemplates.PasswordReset.Body != "New Body" {
		t.Errorf("Expected updated template body 'New Body', got %q", m.emailTemplates.PasswordReset.Body)
	}
}

func TestInitTestEmailForm(t *testing.T) {
	m := &Model{
		Mouls: []schema.Moul{
			{Name: "users", Type: "auth"},
		},
		ActiveSidebarIndex: 0,
	}
	m.initTestEmailForm()

	if m.testEmailRecipient != "" {
		t.Errorf("Expected testEmailRecipient to start empty, got %q", m.testEmailRecipient)
	}
	if m.TestEmailForm == nil {
		t.Fatalf("Expected TestEmailForm to be initialized, got nil")
	}
}
