package typegen

import (
	"bytes"
	"fmt"
	"sort"
	"strings"
	"unicode"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

// GenerateFromDB reads all collections from the given database connection and generates TypeScript declarations.
func GenerateFromDB(dbConn *dbx.DB) (string, error) {
	mouls, err := db.LoadAllMoul(dbConn)
	if err != nil {
		return "", fmt.Errorf("failed to load collections from database: %w", err)
	}
	return GenerateTypeScript(mouls), nil
}

// GenerateTypeScript generates TypeScript type definitions for a slice of Moul collections.
func GenerateTypeScript(mouls []*schema.Moul) string {
	var buf bytes.Buffer

	buf.WriteString("/**\n")
	buf.WriteString(" * Auto-generated TypeScript definitions by `moul typegen`.\n")
	buf.WriteString(" * Do NOT edit manually. Run `moul typegen` to regenerate.\n")
	buf.WriteString(" */\n\n")

	// Base Interfaces
	buf.WriteString("export interface BaseSystemFields {\n")
	buf.WriteString("  id: string;\n")
	buf.WriteString("  created_at: string;\n")
	buf.WriteString("  updated_at: string;\n")
	buf.WriteString("}\n\n")

	buf.WriteString("export interface AuthSystemFields extends BaseSystemFields {\n")
	buf.WriteString("  username: string;\n")
	buf.WriteString("  email: string;\n")
	buf.WriteString("  verified?: boolean;\n")
	buf.WriteString("  otpCode?: string;\n")
	buf.WriteString("  otpExpiresAt?: string;\n")
	buf.WriteString("  passkeys?: string;\n")
	buf.WriteString("  resetToken?: string;\n")
	buf.WriteString("  resetTokenExpiresAt?: string;\n")
	buf.WriteString("  oauthProviders?: string;\n")
	buf.WriteString("}\n\n")

	buf.WriteString("export type WorkerJobState = 'available' | 'executing' | 'completed' | 'discarded' | 'cancelled';\n\n")

	buf.WriteString("export interface WorkerSystemFields extends BaseSystemFields {\n")
	buf.WriteString("  state: WorkerJobState;\n")
	buf.WriteString("  queue: string;\n")
	buf.WriteString("  worker: string;\n")
	buf.WriteString("  args: Record<string, unknown>;\n")
	buf.WriteString("  meta: Record<string, unknown>;\n")
	buf.WriteString("  tags: string[];\n")
	buf.WriteString("  errors: string[];\n")
	buf.WriteString("  attempt: number;\n")
	buf.WriteString("  max_attempts: number;\n")
	buf.WriteString("  priority: number;\n")
	buf.WriteString("  inserted_at: string;\n")
	buf.WriteString("  scheduled_at: string;\n")
	buf.WriteString("  attempted_at?: string;\n")
	buf.WriteString("  attempted_by?: string;\n")
	buf.WriteString("  completed_at?: string;\n")
	buf.WriteString("  discarded_at?: string;\n")
	buf.WriteString("  cancelled_at?: string;\n")
	buf.WriteString("}\n\n")

	buf.WriteString("export interface AnalyticSystemFields extends BaseSystemFields {\n")
	buf.WriteString("  visit_token: string;\n")
	buf.WriteString("  visitor_token: string;\n")
	buf.WriteString("  user_id?: string;\n")
	buf.WriteString("  name: string;\n")
	buf.WriteString("  properties: Record<string, unknown>;\n")
	buf.WriteString("  time: string;\n")
	buf.WriteString("}\n\n")

	// Sort mouls by name for deterministic code generation
	sortedMouls := make([]*schema.Moul, len(mouls))
	copy(sortedMouls, mouls)
	sort.Slice(sortedMouls, func(i, j int) bool {
		return sortedMouls[i].Name < sortedMouls[j].Name
	})

	for _, m := range sortedMouls {
		typeName := toPascalCase(m.Name) + "Record"

		var baseType string
		switch m.Type {
		case "auth":
			baseType = "AuthSystemFields"
		case "worker":
			baseType = "WorkerSystemFields"
		case "analytic":
			baseType = "AnalyticSystemFields"
		default:
			baseType = "BaseSystemFields"
		}

		buf.WriteString(fmt.Sprintf("export interface %s extends %s {\n", typeName, baseType))

		// Sort fields by name
		fields := make([]schema.MoulField, len(m.Fields))
		copy(fields, m.Fields)
		sort.Slice(fields, func(i, j int) bool {
			return fields[i].Name < fields[j].Name
		})

		for _, f := range fields {
			tsType := fieldToTSType(f)
			optMark := ""
			if !f.Required && f.Type != "bool" {
				optMark = "?"
			}
			buf.WriteString(fmt.Sprintf("  %s%s: %s;\n", f.Name, optMark, tsType))

			// If relation, add expand helper property
			if f.Type == "relation" && f.RelationConfig != nil && f.RelationConfig.TargetMoul != "" {
				targetRecord := toPascalCase(f.RelationConfig.TargetMoul) + "Record"
				expandName := f.Name + "_expand"
				buf.WriteString(fmt.Sprintf("  %s?: %s;\n", expandName, targetRecord))
			}
		}

		buf.WriteString("}\n\n")
	}

	// Schema Map
	buf.WriteString("export interface MoulSchema {\n")
	for _, m := range sortedMouls {
		typeName := toPascalCase(m.Name) + "Record"
		buf.WriteString(fmt.Sprintf("  %q: %s;\n", m.Name, typeName))
	}
	buf.WriteString("}\n\n")

	buf.WriteString("export type MoulCollectionName = keyof MoulSchema;\n\n")
	buf.WriteString("export type RecordModel<T extends MoulCollectionName> = MoulSchema[T];\n")

	return buf.String()
}

func fieldToTSType(f schema.MoulField) string {
	switch f.Type {
	case "text", "url", "date", "datetime":
		return "string"
	case "number":
		return "number"
	case "bool":
		return "boolean"
	case "json":
		return "Record<string, unknown> | unknown[] | unknown"
	case "file":
		return "string | string[]"
	case "relation":
		return "string"
	case "select":
		if len(f.Options) > 0 {
			var quotedOpts []string
			for _, opt := range f.Options {
				quotedOpts = append(quotedOpts, fmt.Sprintf("%q", opt))
			}
			return strings.Join(quotedOpts, " | ")
		}
		return "string"
	default:
		return "unknown"
	}
}

func toPascalCase(s string) string {
	parts := strings.FieldsFunc(s, func(r rune) bool {
		return r == '_' || r == '-' || r == ' ' || r == '.'
	})
	for i, part := range parts {
		if len(part) > 0 {
			runes := []rune(part)
			runes[0] = unicode.ToUpper(runes[0])
			parts[i] = string(runes)
		}
	}
	return strings.Join(parts, "")
}
