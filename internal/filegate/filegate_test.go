package filegate

import (
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
	"github.com/pocketbase/dbx"
)

const fileA = "AAAAAAAAAAAAAAA"

func newGate(t *testing.T) (*Gate, *dbx.DB) {
	t.Helper()
	dbConn, err := db.InitDB(":memory:")
	if err != nil {
		t.Fatalf("InitDB: %v", err)
	}
	t.Cleanup(func() {
		if err := dbConn.Close(); err != nil {
			t.Errorf("close: %v", err)
		}
	})
	return New(dbConn, []byte("test-secret"), time.Hour), dbConn
}

func TestSignVerify(t *testing.T) {
	g, _ := newGate(t)
	now := time.Unix(1_800_000_000, 0)
	g.now = func() time.Time { return now }

	sig := g.Sign(fileA)
	if !g.Verify(fileA, sig) {
		t.Fatal("fresh signature rejected")
	}
	if g.Verify("BBBBBBBBBBBBBBB", sig) {
		t.Fatal("signature accepted for another file")
	}
	if g.Verify(fileA, sig+"x") || g.Verify(fileA, "123.abc") || g.Verify(fileA, "garbage") {
		t.Fatal("malformed signature accepted")
	}
	other := New(nil, []byte("other-secret"), time.Hour)
	other.now = g.now
	if other.Verify(fileA, sig) {
		t.Fatal("signature accepted under another key")
	}

	// Stable within a window, valid for at least the TTL, expired after the window ends.
	now = now.Add(10 * time.Minute)
	if g.Sign(fileA) != sig && now.Unix()/3600 == (now.Unix()-600)/3600 {
		t.Fatal("signature changed within one window")
	}
	now = now.Add(time.Hour - 10*time.Minute)
	if !g.Verify(fileA, sig) {
		t.Fatal("signature expired before the TTL elapsed")
	}
	now = now.Add(2 * time.Hour)
	if g.Verify(fileA, sig) {
		t.Fatal("signature still valid after its expiry")
	}
}

func TestSignValue(t *testing.T) {
	g, _ := newGate(t)
	value := []interface{}{map[string]interface{}{
		"id":     fileA,
		"url":    "/storage/" + fileA + "/original.png",
		"thumbs": map[string]interface{}{"sm": "/storage/" + fileA + "/sm.png"},
	}}
	signed := g.SignValue(value).([]interface{})[0].(map[string]interface{})
	if !strings.Contains(signed["url"].(string), "?sig=") || !strings.Contains(signed["thumbs"].(map[string]interface{})["sm"].(string), "?sig=") {
		t.Fatalf("not signed: %v", signed)
	}
	if strings.Contains(value[0].(map[string]interface{})["url"].(string), "sig=") {
		t.Fatal("SignValue modified its input")
	}
}

func TestNormalizeValue(t *testing.T) {
	good := map[string]interface{}{
		"url":      "/storage/" + fileA + "/original.png?sig=1.abc",
		"filename": "photo.png",
		"size":     float64(10),
		"thumbs":   map[string]interface{}{"sm": "https://bucket.example.com/b/" + fileA + "/sm.jpg"},
	}
	got, ids, err := NormalizeValue(good, "https://bucket.example.com/b/", 0)
	if err != nil {
		t.Fatalf("NormalizeValue: %v", err)
	}
	want := map[string]interface{}{
		"id":       fileA,
		"url":      "/storage/" + fileA + "/original.png",
		"filename": "photo.png",
		"size":     float64(10),
		"thumbs":   map[string]interface{}{"sm": "/storage/" + fileA + "/sm.jpg"},
	}
	if !reflect.DeepEqual(got, want) || !reflect.DeepEqual(ids, []string{fileA}) {
		t.Fatalf("got %v %v", got, ids)
	}

	bad := []interface{}{
		"string-value",
		map[string]interface{}{"url": "https://evil.example.com/x.png"},
		map[string]interface{}{"url": "/storage/" + fileA + "/../x"},
		map[string]interface{}{"url": "/storage/" + fileA + "/a/b.png"},
		map[string]interface{}{"url": "/storage/" + fileA + "/%2e%2e"},
		map[string]interface{}{"url": "/storage/short/x.png"},
		map[string]interface{}{"url": "/storage/" + fileA + "/x.png", "script": "x"},
		map[string]interface{}{"url": "/storage/" + fileA + "/x.png", "id": "BBBBBBBBBBBBBBB"},
		map[string]interface{}{"url": "/storage/" + fileA + "/x.png", "thumbs": map[string]interface{}{"sm": "/storage/BBBBBBBBBBBBBBB/sm.png"}},
		map[string]interface{}{"url": "/storage/" + fileA + "/x.png", "size": -1.0},
		[]interface{}{"not-an-object"},
	}
	for _, v := range bad {
		if _, _, err := NormalizeValue(v, "", 0); err == nil {
			t.Fatalf("accepted %v", v)
		}
	}
	list := []interface{}{}
	for i := 0; i < 3; i++ {
		list = append(list, map[string]interface{}{"url": "/storage/" + fileA + "/x.png"})
	}
	if _, _, err := NormalizeValue(list, "", 2); err == nil {
		t.Fatal("list longer than maxItems accepted")
	}
	if v, ids, err := NormalizeValue(nil, "", 0); v != nil || ids != nil || err != nil {
		t.Fatal("nil should clear the field")
	}
}

func TestUploadsAndRefs(t *testing.T) {
	g, dbConn := newGate(t)
	if err := g.RecordUpload(fileA, "users", "alice"); err != nil {
		t.Fatal(err)
	}
	ownerMoul, ownerID, found, err := g.Uploader(fileA)
	if err != nil || !found || ownerMoul != "users" || ownerID != "alice" {
		t.Fatalf("Uploader = %q %q %v %v", ownerMoul, ownerID, found, err)
	}
	if _, _, found, _ := g.Uploader("BBBBBBBBBBBBBBB"); found {
		t.Fatal("unknown upload found")
	}

	if err := g.SetRecordRefs("posts", "p1", map[string][]string{"cover": {fileA}}); err != nil {
		t.Fatal(err)
	}
	refs, err := g.Refs(fileA)
	if err != nil || len(refs) != 1 || refs[0] != (Ref{FileID: fileA, Moul: "posts", RecordID: "p1", Field: "cover"}) {
		t.Fatalf("Refs = %+v %v", refs, err)
	}
	byField, err := g.RecordRefs("posts", "p1")
	if err != nil || !reflect.DeepEqual(byField, map[string][]string{"cover": {fileA}}) {
		t.Fatalf("RecordRefs = %v %v", byField, err)
	}
	if err := g.DeleteRecordRefs("posts", "p1"); err != nil {
		t.Fatal(err)
	}
	if refs, _ := g.Refs(fileA); len(refs) != 0 {
		t.Fatalf("refs survived delete: %v", refs)
	}

	// RebuildMoulRefs indexes records written outside the handlers (imports).
	m := &schema.Moul{ID: "m1", Name: "posts", Type: "base", Fields: []schema.MoulField{{Name: "cover", Type: "file"}}}
	if err := db.CreateMoulTable(dbConn, m); err != nil {
		t.Fatal(err)
	}
	if _, err := dbConn.Insert("posts", dbx.Params{"id": "p2", "createdAt": "x", "updatedAt": "x",
		"cover": `{"id":"` + fileA + `","url":"/storage/` + fileA + `/original.png"}`}).Execute(); err != nil {
		t.Fatal(err)
	}
	if err := g.RebuildMoulRefs(m); err != nil {
		t.Fatal(err)
	}
	if refs, _ := g.Refs(fileA); len(refs) != 1 || refs[0].RecordID != "p2" {
		t.Fatalf("RebuildMoulRefs: %v", refs)
	}

	if err := g.ForgetUpload(fileA); err != nil {
		t.Fatal(err)
	}
	if _, _, found, _ := g.Uploader(fileA); found {
		t.Fatal("upload survived ForgetUpload")
	}
}

func TestPublicCache(t *testing.T) {
	g, _ := newGate(t)
	now := time.Unix(1_800_000_000, 0)
	g.now = func() time.Time { return now }
	g.RememberPublic(fileA)
	if !g.CachedPublic(fileA) {
		t.Fatal("not cached")
	}
	now = now.Add(publicCacheTTL + time.Second)
	if g.CachedPublic(fileA) {
		t.Fatal("cache did not expire")
	}
	g.RememberPublic(fileA)
	if err := g.SetRecordRefs("posts", "p1", map[string][]string{"cover": {fileA}}); err != nil {
		t.Fatal(err)
	}
	if g.CachedPublic(fileA) {
		t.Fatal("reference change did not drop the cached decision")
	}
}
