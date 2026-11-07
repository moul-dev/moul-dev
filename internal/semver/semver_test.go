package semver

import (
	"errors"
	"testing"
)

func mustParse(t *testing.T, s string) Version {
	t.Helper()
	v, err := Parse(s)
	if err != nil {
		t.Fatalf("Parse(%q): %v", s, err)
	}
	return v
}

func TestParse(t *testing.T) {
	v := mustParse(t, "1.0.0-alpha.1")
	if v.Major != 1 || v.Minor != 0 || v.Patch != 0 || len(v.Prerelease) != 2 || v.Prerelease[0] != "alpha" || v.Prerelease[1] != "1" {
		t.Fatalf("Parse(1.0.0-alpha.1) = %+v", v)
	}
	if got := v.Tag(); got != "v1.0.0-alpha.1" {
		t.Errorf("Tag() = %q", got)
	}

	for _, invalid := range []string{
		"v1.0.0", "1.0", "1.0.0.0", "01.0.0", "1.0.0-", "1.0.0-alpha..1", "1.0.0-01",
		"1.0.0+build.1", "1.0.0-alpha_1", "99999999999999999999.0.0", "2026.08.08",
	} {
		if _, err := Parse(invalid); err == nil {
			t.Errorf("Parse(%q) succeeded, want an error", invalid)
		}
	}
}

func TestCompare(t *testing.T) {
	// The precedence example from semver.org, item 11, and numeric ordering of the core.
	ordered := []string{
		"1.0.0-alpha", "1.0.0-alpha.1", "1.0.0-alpha.beta", "1.0.0-beta", "1.0.0-beta.2",
		"1.0.0-beta.11", "1.0.0-rc.1", "1.0.0", "1.0.1", "1.9.0", "1.10.0", "2.0.0-alpha.1", "2.0.0",
	}
	for i := 1; i < len(ordered); i++ {
		lo, hi := mustParse(t, ordered[i-1]), mustParse(t, ordered[i])
		if Compare(hi, lo) <= 0 || Compare(lo, hi) >= 0 {
			t.Errorf("want %s < %s", lo, hi)
		}
	}
	if c := Compare(mustParse(t, "1.0.0-alpha.1"), mustParse(t, "1.0.0-alpha.1")); c != 0 {
		t.Errorf("Compare(equal) = %d", c)
	}
}

func TestBump(t *testing.T) {
	tests := []struct {
		from, kind, preid, want string
	}{
		// Releases
		{"1.4.2", Major, "", "2.0.0"},
		{"1.4.2", Minor, "", "1.5.0"},
		{"1.4.2", Patch, "", "1.4.3"},
		{"1.9.0", Minor, "", "1.10.0"},
		// Graduating a prerelease
		{"1.0.0-alpha.1", Major, "", "1.0.0"},
		{"1.0.0-alpha.1", Minor, "", "1.0.0"},
		{"1.0.0-alpha.1", Patch, "", "1.0.0"},
		{"1.5.0-beta.2", Minor, "", "1.5.0"},
		{"1.5.0-beta.2", Major, "", "2.0.0"},
		{"1.4.3-rc.1", Patch, "", "1.4.3"},
		{"1.4.3-rc.1", Minor, "", "1.5.0"},
		// Prerelease counters and channels
		{"1.0.0-alpha.1", Prerelease, "", "1.0.0-alpha.2"},
		{"1.0.0-alpha.9", Prerelease, "", "1.0.0-alpha.10"},
		{"1.0.0-alpha", Prerelease, "", "1.0.0-alpha.1"},
		{"1.0.0-alpha.1", Prerelease, "alpha", "1.0.0-alpha.2"},
		{"1.0.0-alpha.4", Prerelease, "beta", "1.0.0-beta.1"},
		{"1.0.0-beta.2", Prerelease, "rc", "1.0.0-rc.1"},
		{"1.0.0", Prerelease, "rc", "1.0.1-rc.1"},
		{"1.0.0-1", Prerelease, "alpha", "1.0.0-alpha.1"},
		// Opening a prerelease of the next version
		{"1.4.2", Major, "alpha", "2.0.0-alpha.1"},
		{"1.4.2", Minor, "beta", "1.5.0-beta.1"},
		{"1.4.2", Patch, "rc", "1.4.3-rc.1"},
		{"1.0.0-alpha.3", Major, "alpha", "2.0.0-alpha.1"},
	}
	for _, tt := range tests {
		got, err := Bump(mustParse(t, tt.from), tt.kind, tt.preid)
		if err != nil {
			t.Errorf("Bump(%s, %s, %q): %v", tt.from, tt.kind, tt.preid, err)
			continue
		}
		if got.String() != tt.want {
			t.Errorf("Bump(%s, %s, %q) = %s, want %s", tt.from, tt.kind, tt.preid, got, tt.want)
		}
	}
}

func TestBumpRefuses(t *testing.T) {
	tests := []struct{ from, kind, preid string }{
		{"1.0.0-beta.2", Prerelease, "alpha"}, // would sort before the current channel
		{"1.0.0", Prerelease, ""},             // a release has no channel to continue
		{"1.0.0-1", Prerelease, ""},           // neither does a bare numeric prerelease
		{"1.0.0", Minor, "1"},                 // channels start with a letter
		{"1.0.0", Minor, "al.pha"},
		{"1.0.0", "micro", ""},
	}
	for _, tt := range tests {
		if got, err := Bump(mustParse(t, tt.from), tt.kind, tt.preid); err == nil {
			t.Errorf("Bump(%s, %s, %q) = %s, want an error", tt.from, tt.kind, tt.preid, got)
		}
	}
}

// Every bump sorts after the version it came from, along any sequence of kinds and channels.
func TestBumpAlwaysMovesForward(t *testing.T) {
	kinds := []string{Major, Minor, Patch, Prerelease}
	preids := []string{"", "alpha", "beta", "rc"}
	v := mustParse(t, First)
	for i := 0; i < 500; i++ {
		next, err := Bump(v, kinds[i%len(kinds)], preids[(i/len(kinds)+i)%len(preids)])
		if err != nil {
			continue
		}
		if Compare(next, v) <= 0 {
			t.Fatalf("Bump went from %s to %s", v, next)
		}
		v = next
	}
}

func TestNext(t *testing.T) {
	calVer := []string{"v2026.07", "v2026.08", "v2026.08.08", "v2026.08.09", "v2026.09", "v2026.11.0", "v2026.9.10"}

	got, err := Next(calVer, "", "")
	if err != nil || got.Tag() != "v1.0.0-alpha.1" {
		t.Fatalf("Next(CalVer tags only) = %s, %v; want v1.0.0-alpha.1", got, err)
	}

	tags := append(calVer, "v1.0.0-alpha.1", "v1.0.0-alpha.2", "not-a-tag", "v1.0.0-alpha.10 ")
	if got, err := Next(tags, Prerelease, ""); err != nil || got.Tag() != "v1.0.0-alpha.11" {
		t.Errorf("Next(prerelease) = %s, %v; want v1.0.0-alpha.11", got, err)
	}
	if got, err := Next(tags, Major, ""); err != nil || got.Tag() != "v1.0.0" {
		t.Errorf("Next(major) = %s, %v; want v1.0.0", got, err)
	}
	if _, err := Next(tags, "", ""); !errors.Is(err, ErrNoKind) {
		t.Errorf("Next without a kind: err = %v, want ErrNoKind", err)
	}
}
