package schema

// Clone returns a deep copy of m: no slice, map or pointer of the copy is shared with m, so the
// copy can be modified freely (the schema cache hands out clones). Keep it in step with new
// reference-typed fields; TestCloneSharesNothing fails when one is not copied.
func (m *Moul) Clone() *Moul {
	if m == nil {
		return nil
	}
	c := *m
	if m.Fields != nil {
		c.Fields = make([]MoulField, len(m.Fields))
		for i := range m.Fields {
			c.Fields[i] = m.Fields[i].clone()
		}
	}
	if m.EmailTemplates != nil {
		t := *m.EmailTemplates
		c.EmailTemplates = &t
	}
	if m.Webhooks != nil {
		c.Webhooks = make([]Webhook, len(m.Webhooks))
		for i, w := range m.Webhooks {
			if w.Events != nil {
				w.Events = append([]string(nil), w.Events...)
			}
			c.Webhooks[i] = w
		}
	}
	return &c
}

func (f MoulField) clone() MoulField {
	c := f
	if f.Min != nil {
		v := *f.Min
		c.Min = &v
	}
	if f.Max != nil {
		v := *f.Max
		c.Max = &v
	}
	if f.Options != nil {
		c.Options = append([]string(nil), f.Options...)
	}
	if f.RelationConfig != nil {
		rc := *f.RelationConfig
		c.RelationConfig = &rc
	}
	return c
}
