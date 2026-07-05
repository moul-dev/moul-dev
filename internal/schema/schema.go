package schema

import "encoding/json"

type RelationConfig struct {
	TargetMoul  string `json:"targetMoul"`
	Cardinality string `json:"cardinality"` // "1:1", "1:N", "M:N"
}

type MoulField struct {
	Name           string          `json:"name"`
	Type           string          `json:"type"` // "text", "number", "bool", "json", "file", "relation"
	RelationConfig *RelationConfig `json:"relationConfig,omitempty"`
}


type MoulRules struct {
	ListRule   string `json:"listRule"`
	ViewRule   string `json:"viewRule"`
	CreateRule string `json:"createRule"`
	UpdateRule string `json:"updateRule"`
	DeleteRule string `json:"deleteRule"`
}

type EmailTemplate struct {
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

type EmailTemplates struct {
	Verification       EmailTemplate `json:"verification"`
	PasswordReset      EmailTemplate `json:"password_reset"`
	ConfirmEmailChange EmailTemplate `json:"confirm_email_change"`
	OTP                EmailTemplate `json:"otp"`
	LoginAlert         EmailTemplate `json:"login_alert"`
}

type Moul struct {
	ID             string          `json:"id"`
	Name           string          `json:"name"`
	Type           string          `json:"type"` // "base", "auth", "worker", or "analytic"
	Fields         []MoulField     `json:"fields"`
	Rules          MoulRules       `json:"rules"`
	EmailTemplates *EmailTemplates `json:"email_templates,omitempty"`
	CreatedAt      string          `json:"created_at"`
	UpdatedAt      string          `json:"updated_at"`
}

func GetDefaultEmailTemplates() EmailTemplates {
	return EmailTemplates{
		Verification: EmailTemplate{
			Subject: "Confirm your email address",
			Body:    "Hello,\n\nPlease verify your email by clicking on the link below:\n\n{{.Link}}\n\nRegards,\nSupport Team",
		},
		PasswordReset: EmailTemplate{
			Subject: "Reset your password",
			Body:    "Hello,\n\nYou requested a password reset. Please use the link below to set a new password:\n\n{{.Link}}\n\nIf you did not request this, you can ignore this email.\n\nRegards,\nSupport Team",
		},
		ConfirmEmailChange: EmailTemplate{
			Subject: "Confirm email change",
			Body:    "Hello,\n\nPlease confirm your email address change by clicking on the link below:\n\n{{.Link}}\n\nRegards,\nSupport Team",
		},
		OTP: EmailTemplate{
			Subject: "Your OTP Code",
			Body:    "Hello,\n\nYour one-time password (OTP) code is:\n\n{{.OTP}}\n\nThis code will expire in 10 minutes.\n\nRegards,\nSupport Team",
		},
		LoginAlert: EmailTemplate{
			Subject: "New Login Alert",
			Body:    "Hello,\n\nA new login was detected on your account.\n\nIf this was not you, please secure your account immediately.\n\nRegards,\nSupport Team",
		},
	}
}

// Helper to serialize Fields to JSON for SQLite storage
func (m *Moul) SerializeFields() (string, error) {
	bytes, err := json.Marshal(m.Fields)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// Helper to serialize Rules to JSON for SQLite storage
func (m *Moul) SerializeRules() (string, error) {
	bytes, err := json.Marshal(m.Rules)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}
