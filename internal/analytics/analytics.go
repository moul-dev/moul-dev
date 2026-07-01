package analytics

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net"
	"net/url"
	"strings"
	"time"

	"github.com/charmbracelet/log"

	"github.com/google/uuid"
	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/logger"
	"github.com/moul-dev/moul-dev/internal/util"
	"github.com/oschwald/geoip2-golang"
	"github.com/pocketbase/dbx"
)

// EventParams represents the parameters for tracking an analytic event.
type EventParams struct {
	VisitToken   string
	VisitorToken string
	UserID       string
	Name         string
	Properties   map[string]interface{}
	IP           string
	UserAgent    string
	Referrer     string
	LandingPage  string
}

// Engine manages analytics events and visit tracking.
type Engine struct {
	db        *dbx.DB
	geoReader *geoip2.Reader
	logger    *log.Logger
}

// NewEngine instantiates a new analytics Engine.
func NewEngine(dbConn *dbx.DB, geoIPPath string) (*Engine, error) {
	var reader *geoip2.Reader
	l := logger.With("component", "analytics")

	if geoIPPath != "" {
		r, err := geoip2.Open(geoIPPath)
		if err != nil {
			l.Warn("Failed to open GeoIP database, geolocation will be disabled", "path", geoIPPath, "err", err)
		} else {
			reader = r
			l.Info("GeoIP database loaded successfully", "path", geoIPPath)
		}
	}

	return &Engine{
		db:        dbConn,
		geoReader: reader,
		logger:    l,
	}, nil
}

// Close releases any resources associated with the analytics engine.
func (e *Engine) Close() error {
	if e.geoReader != nil {
		return e.geoReader.Close()
	}
	return nil
}

// Track records a new analytic event and resolves/creates a visit session.
func (e *Engine) Track(ctx context.Context, tableName string, params *EventParams) (map[string]interface{}, error) {
	moul, err := db.LoadMoulByName(e.db, tableName)
	if err != nil {
		return nil, fmt.Errorf("failed to load moul: %w", err)
	}
	if moul.Type != "analytic" {
		return nil, fmt.Errorf("moul '%s' is not of type 'analytic'", tableName)
	}

	visitToken := params.VisitToken
	visitorToken := params.VisitorToken
	userID := params.UserID

	// If visitToken is provided, look up the visit to see if it exists
	var visitExists bool
	if visitToken != "" {
		var count int
		err := e.db.Select("COUNT(*)").From("_visits").Where(dbx.HashExp{"id": visitToken}).Row(&count)
		if err == nil && count > 0 {
			visitExists = true
		}
	}

	// If visitToken doesn't exist or is empty, create a new visit record
	if !visitExists {
		if visitToken == "" {
			visitToken = uuid.NewString()
		}
		if visitorToken == "" {
			visitorToken = uuid.NewString()
		}

		browser, os, device := parseUserAgent(params.UserAgent)
		utmSource, utmMedium, utmTerm, utmContent, utmCampaign := parseUTM(params.LandingPage)
		refDomain := parseReferrerDomain(params.Referrer)
		country, region, city := e.lookupIP(params.IP)

		now := time.Now().UTC().Format(time.RFC3339)

		insertParams := dbx.Params{
			"id":               visitToken,
			"visitor_token":    visitorToken,
			"ip":               params.IP,
			"user_agent":       params.UserAgent,
			"referrer":         params.Referrer,
			"referring_domain": refDomain,
			"landing_page":     params.LandingPage,
			"browser":          browser,
			"os":               os,
			"device_type":      device,
			"country":          country,
			"region":           region,
			"city":             city,
			"utm_source":       utmSource,
			"utm_medium":       utmMedium,
			"utm_term":         utmTerm,
			"utm_content":      utmContent,
			"utm_campaign":     utmCampaign,
			"started_at":       now,
		}
		if userID != "" {
			insertParams["user_id"] = userID
		}

		_, err = e.db.Insert("_visits", insertParams).Execute()
		if err != nil {
			return nil, fmt.Errorf("failed to insert visit: %w", err)
		}
	} else {
		// Visit exists, check if we need to update user_id
		if userID != "" {
			var currentUserID sql.NullString
			err := e.db.Select("user_id").From("_visits").Where(dbx.HashExp{"id": visitToken}).Row(&currentUserID)
			if err == nil && (!currentUserID.Valid || currentUserID.String == "") {
				_, _ = e.db.Update("_visits", dbx.Params{"user_id": userID}, dbx.HashExp{"id": visitToken}).Execute()
			}
		}
	}

	// Insert event into dynamic table
	eventID := fmt.Sprintf("%s-%s", util.Singularize(tableName), util.RandomID())
	now := time.Now().UTC().Format(time.RFC3339)

	propsJSON := "{}"
	if params.Properties != nil {
		bytes, err := json.Marshal(params.Properties)
		if err == nil {
			propsJSON = string(bytes)
		}
	}

	insertParams := dbx.Params{
		"id":            eventID,
		"visit_token":   visitToken,
		"visitor_token": visitorToken,
		"name":          params.Name,
		"properties":    propsJSON,
		"time":          now,
	}
	if userID != "" {
		insertParams["user_id"] = userID
	}

	// Handle custom fields
	for _, field := range moul.Fields {
		lowerName := strings.ToLower(field.Name)
		if lowerName == "visit_token" || lowerName == "visitor_token" ||
			lowerName == "user_id" || lowerName == "name" ||
			lowerName == "properties" || lowerName == "time" || lowerName == "id" {
			continue
		}
		if val, ok := params.Properties[field.Name]; ok {
			if field.Type == "json" {
				bytes, err := json.Marshal(val)
				if err == nil {
					insertParams[field.Name] = string(bytes)
				}
			} else if field.Type == "bool" {
				if boolVal, ok := val.(bool); ok {
					if boolVal {
						insertParams[field.Name] = 1
					} else {
						insertParams[field.Name] = 0
					}
				} else {
					insertParams[field.Name] = val
				}
			} else {
				insertParams[field.Name] = val
			}
		}
	}

	_, err = e.db.Insert(tableName, insertParams).Execute()
	if err != nil {
		return nil, fmt.Errorf("failed to insert analytic event: %w", err)
	}

	// Fetch dynamic event record back
	var record dbx.NullStringMap
	err = e.db.Select("*").From(tableName).Where(dbx.HashExp{"id": eventID}).One(&record)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch recorded event: %w", err)
	}

	res := make(map[string]interface{})
	for k, v := range record {
		if v.Valid {
			res[k] = v.String
		} else {
			res[k] = nil
		}
	}

	return res, nil
}

// parseUserAgent parses a raw User-Agent string into browser, OS, and device type.
func parseUserAgent(ua string) (browser, os, device string) {
	if ua == "" {
		return "Unknown", "Unknown", "desktop"
	}

	uaLower := strings.ToLower(ua)

	// OS detection
	if strings.Contains(ua, "Windows") {
		os = "Windows"
	} else if strings.Contains(ua, "Android") {
		os = "Android"
	} else if strings.Contains(ua, "Linux") {
		os = "Linux"
	} else if strings.Contains(ua, "iPhone") || strings.Contains(ua, "iPad") || strings.Contains(ua, "iPod") {
		os = "iOS"
	} else if strings.Contains(ua, "Macintosh") || strings.Contains(ua, "Mac OS X") {
		os = "macOS"
	} else {
		os = "Unknown"
	}

	// Browser detection
	if strings.Contains(ua, "Firefox") || strings.Contains(ua, "FxiOS") {
		browser = "Firefox"
	} else if strings.Contains(ua, "Edg") || strings.Contains(ua, "EdgiOS") {
		browser = "Edge"
	} else if strings.Contains(ua, "OPR") || strings.Contains(ua, "Opera") || strings.Contains(ua, "Opt") {
		browser = "Opera"
	} else if strings.Contains(ua, "Chrome") || strings.Contains(ua, "CriOS") {
		browser = "Chrome"
	} else if strings.Contains(ua, "Safari") {
		browser = "Safari"
	} else if strings.Contains(ua, "MSIE") || strings.Contains(ua, "Trident") {
		browser = "Internet Explorer"
	} else {
		browser = "Unknown"
	}

	// Device Type detection
	if strings.Contains(ua, "iPad") || strings.Contains(uaLower, "tablet") || (strings.Contains(ua, "Android") && !strings.Contains(uaLower, "mobi")) {
		device = "tablet"
	} else if strings.Contains(uaLower, "mobi") || strings.Contains(ua, "iPhone") || strings.Contains(ua, "iPod") {
		device = "mobile"
	} else {
		device = "desktop"
	}

	return
}

// parseUTM extracts UTM parameters from a landing page URL query.
func parseUTM(landingPage string) (src, med, term, cont, camp string) {
	if landingPage == "" {
		return
	}
	u, err := url.Parse(landingPage)
	if err != nil {
		return
	}
	q := u.Query()
	src = q.Get("utm_source")
	med = q.Get("utm_medium")
	term = q.Get("utm_term")
	cont = q.Get("utm_content")
	camp = q.Get("utm_campaign")
	return
}

// parseReferrerDomain parses the host/domain name from a Referrer URL.
func parseReferrerDomain(referrer string) string {
	if referrer == "" {
		return ""
	}
	u, err := url.Parse(referrer)
	if err != nil {
		return ""
	}
	return u.Hostname()
}

// lookupIP resolves geolocation details (Country, Region, City) using MaxMind Reader.
func (e *Engine) lookupIP(ipStr string) (country, region, city string) {
	if e.geoReader == nil || ipStr == "" {
		return
	}
	// Handle localhost/private ranges
	if ipStr == "127.0.0.1" || ipStr == "::1" || strings.HasPrefix(ipStr, "192.168.") || strings.HasPrefix(ipStr, "10.") {
		return "Localhost", "Localhost", "Localhost"
	}
	ip := net.ParseIP(ipStr)
	if ip == nil {
		// Strip port if present
		if host, _, err := net.SplitHostPort(ipStr); err == nil {
			ip = net.ParseIP(host)
		}
	}
	if ip == nil {
		return
	}
	record, err := e.geoReader.City(ip)
	if err != nil {
		return
	}
	country = record.Country.Names["en"]
	if len(record.Subdivisions) > 0 {
		region = record.Subdivisions[0].Names["en"]
	}
	city = record.City.Names["en"]
	return
}
