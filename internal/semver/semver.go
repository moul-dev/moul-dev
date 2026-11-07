// Package semver parses, orders and bumps the SemVer 2.0.0 versions Moul is released under.
//
// The engine tags releases vMAJOR.MINOR.PATCH with an optional prerelease (v1.0.0-alpha.1), and
// @moul-dev/web-component publishes the same versions without the v. Both bump by the same rules
// (`make next-version` here, `bun run bump` there):
//
//   - major, minor and patch increment that part and reset the lower ones. A prerelease graduates
//     to the version it leads up to when that is enough: 1.0.0-alpha.3 + major = 1.0.0.
//   - With a prerelease channel (preid), they open a prerelease of that version instead:
//     1.4.2 + minor/beta = 1.5.0-beta.1.
//   - prerelease advances the current channel's counter (1.0.0-alpha.1 → 1.0.0-alpha.2), moves to
//     another channel (→ 1.0.0-beta.1), or, from a release, opens one for the next patch.
//
// Counters start at 1, and a bump never produces a version that does not sort after the current
// one. Build metadata (+…) is not accepted, since it plays no part in ordering.
package semver

import (
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

// First is the first SemVer release. Tags before it used CalVer (v2026.07 to v2026.09) and are
// ignored when looking for the latest release.
const First = "1.0.0-alpha.1"

// calVerMajor is the smallest major version that is really a CalVer year, never a SemVer major.
const calVerMajor = 2000

// Kinds of release a bump can make.
const (
	Major      = "major"
	Minor      = "minor"
	Patch      = "patch"
	Prerelease = "prerelease"
)

var (
	versionPattern = regexp.MustCompile(`^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)` +
		`(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?$`)
	numericPattern = regexp.MustCompile(`^(0|[1-9]\d*)$`)
	preidPattern   = regexp.MustCompile(`^[A-Za-z][0-9A-Za-z-]*$`)
)

// Version is a parsed SemVer version.
type Version struct {
	Major, Minor, Patch uint64
	// Prerelease holds the dot-separated prerelease identifiers, empty for a release.
	Prerelease []string
}

// Parse reads a version without a leading v.
func Parse(s string) (Version, error) {
	m := versionPattern.FindStringSubmatch(s)
	if m == nil {
		return Version{}, fmt.Errorf("%q is not SemVer (MAJOR.MINOR.PATCH with an optional -prerelease)", s)
	}
	var v Version
	var err error
	for i, part := range []*uint64{&v.Major, &v.Minor, &v.Patch} {
		if *part, err = strconv.ParseUint(m[i+1], 10, 64); err != nil {
			return Version{}, fmt.Errorf("%q: %w", s, err)
		}
	}
	if m[4] != "" {
		v.Prerelease = strings.Split(m[4], ".")
		for _, id := range v.Prerelease {
			if numericPattern.MatchString(id) {
				if _, err := strconv.ParseUint(id, 10, 64); err != nil {
					return Version{}, fmt.Errorf("%q: %w", s, err)
				}
			}
		}
	}
	return v, nil
}

// ParseTag reads a release tag: a version with a leading v.
func ParseTag(tag string) (Version, error) {
	if !strings.HasPrefix(tag, "v") {
		return Version{}, fmt.Errorf("tag %q does not start with v", tag)
	}
	return Parse(tag[1:])
}

// String formats the version without a leading v.
func (v Version) String() string {
	s := fmt.Sprintf("%d.%d.%d", v.Major, v.Minor, v.Patch)
	if len(v.Prerelease) > 0 {
		s += "-" + strings.Join(v.Prerelease, ".")
	}
	return s
}

// Tag formats the version as a release tag, with a leading v.
func (v Version) Tag() string { return "v" + v.String() }

// IsPrerelease reports whether v has prerelease identifiers.
func (v Version) IsPrerelease() bool { return len(v.Prerelease) > 0 }

func compareUint(a, b uint64) int {
	switch {
	case a < b:
		return -1
	case a > b:
		return 1
	}
	return 0
}

// numeric returns the value of a numeric prerelease identifier, and false for an alphanumeric one.
// Parse has already refused numeric identifiers that overflow uint64.
func numeric(id string) (uint64, bool) {
	if !numericPattern.MatchString(id) {
		return 0, false
	}
	n, err := strconv.ParseUint(id, 10, 64)
	return n, err == nil
}

func compareIdentifier(a, b string) int {
	x, aNum := numeric(a)
	y, bNum := numeric(b)
	switch {
	case aNum && bNum:
		return compareUint(x, y)
	case aNum: // numeric identifiers sort before alphanumeric ones
		return -1
	case bNum:
		return 1
	}
	return strings.Compare(a, b)
}

// Compare orders a and b by SemVer precedence: -1, 0 or +1.
func Compare(a, b Version) int {
	if c := compareUint(a.Major, b.Major); c != 0 {
		return c
	}
	if c := compareUint(a.Minor, b.Minor); c != 0 {
		return c
	}
	if c := compareUint(a.Patch, b.Patch); c != 0 {
		return c
	}
	// A release sorts after every prerelease of the same version.
	switch {
	case !a.IsPrerelease() && !b.IsPrerelease():
		return 0
	case !a.IsPrerelease():
		return 1
	case !b.IsPrerelease():
		return -1
	}
	for i := 0; i < len(a.Prerelease) && i < len(b.Prerelease); i++ {
		if c := compareIdentifier(a.Prerelease[i], b.Prerelease[i]); c != 0 {
			return c
		}
	}
	return compareUint(uint64(len(a.Prerelease)), uint64(len(b.Prerelease)))
}

// Bump returns the version after v for a kind of release (Major, Minor, Patch or Prerelease) and an
// optional prerelease channel. It fails when the result would not sort after v.
func Bump(v Version, kind, preid string) (Version, error) {
	if preid != "" && !preidPattern.MatchString(preid) {
		return Version{}, fmt.Errorf("%q is not a prerelease channel: use letters, digits and hyphens, starting with a letter (alpha, beta, rc)", preid)
	}

	next := Version{Major: v.Major, Minor: v.Minor, Patch: v.Patch}
	switch kind {
	case Major:
		if !v.IsPrerelease() || v.Minor != 0 || v.Patch != 0 || preid != "" {
			next = Version{Major: v.Major + 1}
		}
	case Minor:
		if !v.IsPrerelease() || v.Patch != 0 || preid != "" {
			next = Version{Major: v.Major, Minor: v.Minor + 1}
		}
	case Patch:
		if !v.IsPrerelease() || preid != "" {
			next.Patch++
		}
	case Prerelease:
		if !v.IsPrerelease() {
			if preid == "" {
				return Version{}, fmt.Errorf("%s is a release: set PREID=alpha|beta|rc to start a prerelease of the next patch, or bump major or minor with a PREID", v)
			}
			next.Patch++
			next.Prerelease = []string{preid, "1"}
			break
		}
		channel := preid
		if channel == "" {
			channel = v.Prerelease[0]
			if _, isNumber := numeric(channel); isNumber {
				return Version{}, fmt.Errorf("%s has no prerelease channel to continue: set PREID=alpha|beta|rc", v)
			}
		}
		if n, ok := numeric(v.Prerelease[len(v.Prerelease)-1]); ok && v.Prerelease[0] == channel {
			next.Prerelease = append(append([]string{}, v.Prerelease[:len(v.Prerelease)-1]...), strconv.FormatUint(n+1, 10))
		} else {
			next.Prerelease = []string{channel, "1"}
		}
	default:
		return Version{}, fmt.Errorf("unknown release kind %q: use major, minor, patch or prerelease", kind)
	}

	if preid != "" && kind != Prerelease {
		next.Prerelease = []string{preid, "1"}
	}
	if Compare(next, v) <= 0 {
		return Version{}, fmt.Errorf("%s would not sort after %s: prerelease channels sort alphabetically (alpha < beta < rc)", next, v)
	}
	return next, nil
}

// Latest returns the highest SemVer release among tags, skipping tags that are not
// vMAJOR.MINOR.PATCH[-prerelease] and the CalVer tags from before First.
func Latest(tags []string) (Version, bool) {
	var latest Version
	found := false
	for _, tag := range tags {
		v, err := ParseTag(strings.TrimSpace(tag))
		if err != nil || v.Major >= calVerMajor {
			continue
		}
		if !found || Compare(v, latest) > 0 {
			latest, found = v, true
		}
	}
	return latest, found
}

// ErrNoKind is returned by Next when releases exist but no kind of release was given.
var ErrNoKind = errors.New("no release kind")

// Next returns the version to release after the latest SemVer tag in tags. Before any SemVer tag
// exists it returns First, whatever the kind.
func Next(tags []string, kind, preid string) (Version, error) {
	latest, ok := Latest(tags)
	if !ok {
		return Parse(First)
	}
	if kind == "" {
		return Version{}, fmt.Errorf("%w: the latest release is %s, set BUMP=major|minor|patch|prerelease (and PREID=alpha|beta|rc to open or switch a prerelease channel)", ErrNoKind, latest.Tag())
	}
	return Bump(latest, kind, preid)
}
