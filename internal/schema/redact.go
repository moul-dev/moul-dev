package schema

import "strings"

// SecretColumns are system columns that never leave the server: credentials, one-time codes,
// reset tokens and linked OAuth identities.
var SecretColumns = []string{
	"passwordHash",
	"tokenKey",
	"otpCode",
	"otpExpiresAt",
	"otpAttempts",
	"passkeys",
	"resetToken",
	"resetTokenExpiresAt",
	"oauthProviders",
}

// EmailVisibilityField is the optional bool field of an auth collection that lets a user publish
// their email address to everyone who may view their record.
const EmailVisibilityField = "emailVisibility"

// StripSecrets deletes secret columns and the companion blind-index columns of cloak fields.
func StripSecrets(m *Moul, rec map[string]interface{}) {
	if rec == nil {
		return
	}
	for _, col := range SecretColumns {
		delete(rec, col)
	}
	if m == nil {
		return
	}
	for _, field := range m.Fields {
		if field.Type == "cloak" {
			delete(rec, field.Name+"Hash")
		}
	}
}

// RedactForViewer removes from an outgoing record what viewer may not see: secrets always, and
// the email of an auth record unless the viewer is an admin, is that user, or the record opted in
// through its emailVisibility field.
func RedactForViewer(m *Moul, rec map[string]interface{}, viewer map[string]interface{}, isAdmin bool) {
	StripSecrets(m, rec)
	if rec == nil || m == nil || m.Type != "auth" || isAdmin {
		return
	}
	if isSelf(m, rec, viewer) || emailPublished(m, rec) {
		return
	}
	delete(rec, "email")
}

func isSelf(m *Moul, rec map[string]interface{}, viewer map[string]interface{}) bool {
	if viewer == nil {
		return false
	}
	viewerID, _ := viewer["id"].(string)
	viewerMoul, _ := viewer["moul"].(string)
	recID, _ := rec["id"].(string)
	return viewerID != "" && viewerID == recID && viewerMoul == m.Name
}

func emailPublished(m *Moul, rec map[string]interface{}) bool {
	hasField := false
	for _, f := range m.Fields {
		if f.Name == EmailVisibilityField {
			hasField = true
			break
		}
	}
	if !hasField {
		return false
	}
	switch v := rec[EmailVisibilityField].(type) {
	case bool:
		return v
	case string:
		return v == "1" || strings.EqualFold(v, "true")
	case float64:
		return v != 0
	case int64:
		return v != 0
	case int:
		return v != 0
	}
	return false
}
