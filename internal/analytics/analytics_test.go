package analytics

import (
	"context"
	"testing"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

func TestParseUserAgent(t *testing.T) {
	tests := []struct {
		ua              string
		expectedBrowser string
		expectedOS      string
		expectedDevice  string
	}{
		{
			ua:              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			expectedBrowser: "Chrome",
			expectedOS:      "macOS",
			expectedDevice:  "desktop",
		},
		{
			ua:              "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
			expectedBrowser: "Safari",
			expectedOS:      "iOS",
			expectedDevice:  "mobile",
		},
		{
			ua:              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
			expectedBrowser: "Chrome",
			expectedOS:      "Android",
			expectedDevice:  "mobile",
		},
		{
			ua:              "Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15",
			expectedBrowser: "Firefox",
			expectedOS:      "iOS",
			expectedDevice:  "tablet",
		},
		{
			ua:              "",
			expectedBrowser: "Unknown",
			expectedOS:      "Unknown",
			expectedDevice:  "desktop",
		},
	}

	for _, tt := range tests {
		b, o, d := parseUserAgent(tt.ua)
		if b != tt.expectedBrowser || o != tt.expectedOS || d != tt.expectedDevice {
			t.Errorf("parseUserAgent(%q) = (%q, %q, %q); expected (%q, %q, %q)",
				tt.ua, b, o, d, tt.expectedBrowser, tt.expectedOS, tt.expectedDevice)
		}
	}
}

func TestParseUTM(t *testing.T) {
	landingPage := "https://moul.dev/home?utm_source=newsletter&utm_medium=email&utm_campaign=summer_sale&utm_term=shoes&utm_content=banner_ad"
	src, med, term, cont, camp := parseUTM(landingPage)

	if src != "newsletter" || med != "email" || camp != "summer_sale" || term != "shoes" || cont != "banner_ad" {
		t.Errorf("parseUTM failed: got source=%q, medium=%q, campaign=%q, term=%q, content=%q", src, med, camp, term, cont)
	}
}

func TestParseReferrerDomain(t *testing.T) {
	ref := "https://github.com/moul-dev/moul-dev"
	domain := parseReferrerDomain(ref)
	if domain != "github.com" {
		t.Errorf("parseReferrerDomain(%q) = %q; expected github.com", ref, domain)
	}
}

func TestAnalyticsEngineTrack(t *testing.T) {
	// 1. Initialize in-memory DB
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("Failed to init db: %v", err)
	}
	defer dbConn.Close()

	// 2. Instantiate analytics engine
	engine, err := NewEngine(dbConn, "")
	if err != nil {
		t.Fatalf("Failed to create analytics engine: %v", err)
	}
	defer engine.Close()

	// 3. Create 'page_views' analytic Moul schema
	moulSchema := &schema.Moul{
		ID:   "moul-pv123",
		Name: "page_views",
		Type: "analytic",
		Fields: []schema.MoulField{
			{Name: "path", Type: "text"},
			{Name: "speed", Type: "number"},
		},
	}

	if err := db.CreateMoulTable(dbConn, moulSchema); err != nil {
		t.Fatalf("Failed to create page_views table: %v", err)
	}
	if err := db.SaveMoulMetadata(dbConn, moulSchema); err != nil {
		t.Fatalf("Failed to save page_views metadata: %v", err)
	}

	// 4. Track event (should automatically register a visit)
	ctx := context.Background()
	params := &EventParams{
		VisitToken:   "v-111",
		VisitorToken: "visitor-222",
		UserID:       "u-333",
		Name:         "page_view",
		Properties: map[string]interface{}{
			"path":  "/pricing",
			"speed": 120.5,
		},
		IP:          "1.2.3.4",
		UserAgent:   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
		Referrer:    "https://google.com/search",
		LandingPage: "https://moul.dev/pricing?utm_source=google&utm_medium=cpc",
	}

	res, err := engine.Track(ctx, "page_views", params)
	if err != nil {
		t.Fatalf("Failed to track event: %v", err)
	}

	if res["visit_token"] != "v-111" || res["visitor_token"] != "visitor-222" || res["user_id"] != "u-333" || res["name"] != "page_view" {
		t.Errorf("Track returned unexpected payload: %+v", res)
	}

	// 5. Query visits table to ensure visit was created correctly
	var visit struct {
		ID             string `db:"id"`
		VisitorToken   string `db:"visitor_token"`
		UserID         string `db:"user_id"`
		IP             string `db:"ip"`
		Browser        string `db:"browser"`
		OS             string `db:"os"`
		DeviceType     string `db:"device_type"`
		ReferrerDomain string `db:"referring_domain"`
		UTMSource      string `db:"utm_source"`
		UTMMedium      string `db:"utm_medium"`
	}

	err = dbConn.Select("id", "visitor_token", "user_id", "ip", "browser", "os", "device_type", "referring_domain", "utm_source", "utm_medium").
		From("_visits").
		Where(dbx.HashExp{"id": "v-111"}).
		One(&visit)

	if err != nil {
		t.Fatalf("Failed to fetch visit: %v", err)
	}

	if visit.VisitorToken != "visitor-222" || visit.UserID != "u-333" || visit.IP != "1.2.3.4" ||
		visit.Browser != "Chrome" || visit.OS != "Windows" || visit.DeviceType != "desktop" ||
		visit.ReferrerDomain != "google.com" || visit.UTMSource != "google" || visit.UTMMedium != "cpc" {
		t.Errorf("Visit record has incorrect fields: %+v", visit)
	}

	// 6. Track another event with the same visit_token (should NOT create a new visit)
	params2 := &EventParams{
		VisitToken:   "v-111",
		VisitorToken: "visitor-222",
		Name:         "click_signup",
		Properties: map[string]interface{}{
			"path": "/pricing",
		},
	}

	_, err = engine.Track(ctx, "page_views", params2)
	if err != nil {
		t.Fatalf("Failed to track second event: %v", err)
	}

	var visitCount int
	err = dbConn.Select("COUNT(*)").From("_visits").Row(&visitCount)
	if err != nil || visitCount != 1 {
		t.Errorf("Expected 1 visit in DB, got %d, err=%v", visitCount, err)
	}

	var eventCount int
	err = dbConn.Select("COUNT(*)").From("page_views").Row(&eventCount)
	if err != nil || eventCount != 2 {
		t.Errorf("Expected 2 events in page_views table, got %d, err=%v", eventCount, err)
	}
}
