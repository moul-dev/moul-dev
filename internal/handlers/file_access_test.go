package handlers

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/textproto"
	"os"
	"strings"
	"testing"

	"github.com/moul-dev/moul-dev/internal/db"
	"github.com/moul-dev/moul-dev/internal/schema"
)

func pngBytes(t *testing.T) []byte {
	t.Helper()
	img := image.NewRGBA(image.Rect(0, 0, 4, 4))
	img.Set(1, 1, color.RGBA{R: 255, A: 255})
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		t.Fatalf("encode png: %v", err)
	}
	return buf.Bytes()
}

// upload posts one file as multipart form data and returns the recorder.
func (e *securityEnv) upload(filename, declaredType string, content []byte, who caller) *httptest.ResponseRecorder {
	e.t.Helper()
	var body bytes.Buffer
	w := multipart.NewWriter(&body)
	h := make(textproto.MIMEHeader)
	h.Set("Content-Disposition", `form-data; name="file"; filename="`+filename+`"`)
	if declaredType != "" {
		h.Set("Content-Type", declaredType)
	}
	part, err := w.CreatePart(h)
	if err != nil {
		e.t.Fatalf("create part: %v", err)
	}
	if _, err := part.Write(content); err != nil {
		e.t.Fatalf("write part: %v", err)
	}
	if err := w.Close(); err != nil {
		e.t.Fatalf("close multipart: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, "/api/upload", &body)
	req.Header.Set("Content-Type", w.FormDataContentType())
	if who.token != "" {
		req.Header.Set("Authorization", "Bearer "+who.token)
	}
	if who.adminKey != "" {
		req.Header.Set("X-Admin-Key", who.adminKey)
	}
	rec := httptest.NewRecorder()
	e.router.ServeHTTP(rec, req)
	return rec
}

func uploaded(t *testing.T, rec *httptest.ResponseRecorder) map[string]interface{} {
	t.Helper()
	expectStatus(t, rec, http.StatusOK)
	files := decode[[]map[string]interface{}](t, rec)
	if len(files) != 1 {
		t.Fatalf("upload response: %v", files)
	}
	return files[0]
}

func fileCollections() []*schema.Moul {
	return []*schema.Moul{
		{
			ID: "moul_garages", Name: "garages", Type: "base",
			Fields: []schema.MoulField{
				{Name: "photo", Type: "file"},
				{Name: "owner", Type: "relation", RelationConfig: &schema.RelationConfig{TargetMoul: "users", Cardinality: "1:N"}},
			},
			Rules: schema.MoulRules{
				ListRule: "owner = @request.auth.id", ViewRule: "owner = @request.auth.id",
				CreateRule: "owner = @request.auth.id", UpdateRule: "owner = @request.auth.id",
			},
		},
		{
			ID: "moul_builds", Name: "builds", Type: "base",
			Fields: []schema.MoulField{
				{Name: "images", Type: "file"},
				{Name: "author", Type: "relation", RelationConfig: &schema.RelationConfig{TargetMoul: "users", Cardinality: "1:N"}},
			},
			Rules: schema.MoulRules{CreateRule: "author = @request.auth.id"},
		},
	}
}

func storagePathOf(u string) string {
	if i := strings.IndexByte(u, '?'); i >= 0 {
		return u[:i]
	}
	return u
}

func TestUploads_MembersCannotStoreActiveContent(t *testing.T) {
	env := newSecurityEnv(t)
	defer os.RemoveAll("storage")
	env.insertUser("alice", "alice@example.com")
	alice := bearer(env.memberToken("alice"))

	cases := []struct {
		name, declared string
		content        []byte
	}{
		{"page.html", "text/html", []byte("<html><script>alert(1)</script></html>")},
		{"logo.svg", "image/svg+xml", []byte(`<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`)},
		{"image.png", "image/png", []byte("<!DOCTYPE html><script>alert(1)</script>")},
		{"photo.png", "text/html", pngBytes(t)},
	}
	for _, tc := range cases {
		if rec := env.upload(tc.name, tc.declared, tc.content, alice); rec.Code != http.StatusBadRequest {
			t.Fatalf("%s: status = %d, want 400; body: %s", tc.name, rec.Code, rec.Body.String())
		}
	}

	// Admins keep console uploads of any type; the file is still served as a sandboxed attachment.
	info := uploaded(t, env.upload("page.html", "text/html", []byte("<html></html>"), withAdminKey()))
	rec := env.do(http.MethodGet, storagePathOf(info["url"].(string)), nil, withAdminKey())
	expectStatus(t, rec, http.StatusOK)
	if !strings.HasPrefix(rec.Header().Get("Content-Disposition"), "attachment") || rec.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Fatalf("html upload served inline: %v", rec.Header())
	}

	// file_allowed_types narrows member uploads further.
	if _, err := env.db.NewQuery("INSERT INTO _settings (key, value) VALUES ('file_allowed_types', 'image/jpeg')").Execute(); err != nil {
		t.Fatal(err)
	}
	if rec := env.upload("photo.png", "image/png", pngBytes(t), alice); rec.Code != http.StatusBadRequest {
		t.Fatalf("png allowed despite file_allowed_types=image/jpeg: %d", rec.Code)
	}
}

func TestFiles_PrivateRecordFilesNeedASignature(t *testing.T) {
	env := newSecurityEnv(t, fileCollections()...)
	defer os.RemoveAll("storage")
	env.insertUser("alice", "alice@example.com")
	env.insertUser("bob", "bob@example.com")
	alice := bearer(env.memberToken("alice"))
	bob := bearer(env.memberToken("bob"))

	photo := uploaded(t, env.upload("garage.png", "image/png", pngBytes(t), alice))
	signedURL := photo["url"].(string)
	plainURL := storagePathOf(signedURL)
	if !strings.Contains(signedURL, "?sig=") {
		t.Fatalf("upload response is not signed for the uploader: %v", signedURL)
	}

	// The uploader's signed preview works; the bare URL does not for anyone else.
	expectStatus(t, env.do(http.MethodGet, signedURL, nil, guest), http.StatusOK)
	expectStatus(t, env.do(http.MethodGet, plainURL, nil, guest), http.StatusNotFound)

	// Attach it to alice's private garage; the stored value is canonical (no signature).
	rec := env.do(http.MethodPost, "/api/moul/garages/records", map[string]interface{}{"owner": "alice", "photo": photo}, alice)
	expectStatus(t, rec, http.StatusCreated)
	garage := decode[map[string]interface{}](t, rec)
	var stored string
	if err := env.db.NewQuery("SELECT photo FROM garages WHERE id = {:id}").Bind(map[string]interface{}{"id": garage["id"]}).Row(&stored); err != nil {
		t.Fatal(err)
	}
	if strings.Contains(stored, "sig=") {
		t.Fatalf("signature stored in the record: %s", stored)
	}

	// Strangers get the same 404 as a missing file; the owner's record response carries a working URL.
	for _, who := range []caller{guest, bob} {
		hidden := env.do(http.MethodGet, plainURL, nil, who)
		missing := env.do(http.MethodGet, "/storage/ZZZZZZZZZZZZZZZ/original.png", nil, who)
		if hidden.Code != http.StatusNotFound || hidden.Body.String() != missing.Body.String() {
			t.Fatalf("private file: %d %s vs missing %d %s", hidden.Code, hidden.Body.String(), missing.Code, missing.Body.String())
		}
	}
	got := decode[map[string]interface{}](t, env.do(http.MethodGet, "/api/moul/garages/records/"+garage["id"].(string), nil, alice))
	ownerURL := got["photo"].(map[string]interface{})["url"].(string)
	expectStatus(t, env.do(http.MethodGet, ownerURL, nil, guest), http.StatusOK)

	// A forged or foreign signature does not open another file.
	other := uploaded(t, env.upload("other.png", "image/png", pngBytes(t), bob))
	otherSig := strings.SplitN(other["url"].(string), "?", 2)[1]
	expectStatus(t, env.do(http.MethodGet, plainURL+"?"+otherSig, nil, guest), http.StatusNotFound)
	expectStatus(t, env.do(http.MethodGet, plainURL+"?sig=9999999999.forged", nil, guest), http.StatusNotFound)

	// Bob cannot attach alice's upload to a record of his own.
	rec = env.do(http.MethodPost, "/api/moul/garages/records", map[string]interface{}{"owner": "bob", "photo": photo}, bob)
	expectStatus(t, rec, http.StatusBadRequest)
}

func TestFiles_PublicRecordFilesAreServedUnsigned(t *testing.T) {
	env := newSecurityEnv(t, fileCollections()...)
	defer os.RemoveAll("storage")
	env.insertUser("alice", "alice@example.com")
	alice := bearer(env.memberToken("alice"))

	img := uploaded(t, env.upload("build.png", "image/png", pngBytes(t), alice))
	rec := env.do(http.MethodPost, "/api/moul/builds/records", map[string]interface{}{"author": "alice", "images": []interface{}{img}}, alice)
	expectStatus(t, rec, http.StatusCreated)
	build := decode[map[string]interface{}](t, rec)
	url := build["images"].([]interface{})[0].(map[string]interface{})["url"].(string)
	if strings.Contains(url, "sig=") {
		t.Fatalf("public record file was signed: %s", url)
	}
	res := env.do(http.MethodGet, url, nil, guest)
	expectStatus(t, res, http.StatusOK)
	if res.Header().Get("Content-Disposition") != "" {
		t.Fatalf("image served as attachment: %v", res.Header())
	}
}

func TestFiles_FieldValuesMustBeOwnUploads(t *testing.T) {
	env := newSecurityEnv(t, fileCollections()...)
	defer os.RemoveAll("storage")
	env.insertUser("alice", "alice@example.com")
	alice := bearer(env.memberToken("alice"))
	img := uploaded(t, env.upload("build.png", "image/png", pngBytes(t), alice))

	bad := []interface{}{
		"https://evil.example.com/x.png",
		map[string]interface{}{"url": "https://evil.example.com/x.png"},
		map[string]interface{}{"url": "/storage/" + img["id"].(string) + "/../../moul-local.db"},
		map[string]interface{}{"url": storagePathOf(img["url"].(string)), "onload": "alert(1)"},
		map[string]interface{}{"url": storagePathOf(img["url"].(string)), "filename": strings.Repeat("a", 600)},
		map[string]interface{}{"id": "ZZZZZZZZZZZZZZZ", "url": storagePathOf(img["url"].(string))},
		map[string]interface{}{"url": "/storage/ZZZZZZZZZZZZZZZ/original.png"},
	}
	for _, v := range bad {
		rec := env.do(http.MethodPost, "/api/moul/builds/records", map[string]interface{}{"author": "alice", "images": []interface{}{v}}, alice)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("file value %v accepted: %d %s", v, rec.Code, rec.Body.String())
		}
	}
}

func TestFiles_PublicDecisionFollowsChanges(t *testing.T) {
	env := newSecurityEnv(t, fileCollections()...)
	defer os.RemoveAll("storage")
	env.insertUser("alice", "alice@example.com")
	alice := bearer(env.memberToken("alice"))

	img := uploaded(t, env.upload("build.png", "image/png", pngBytes(t), alice))
	rec := env.do(http.MethodPost, "/api/moul/builds/records", map[string]interface{}{"author": "alice", "images": []interface{}{img}}, alice)
	expectStatus(t, rec, http.StatusCreated)
	build := decode[map[string]interface{}](t, rec)
	plain := storagePathOf(img["url"].(string))
	expectStatus(t, env.do(http.MethodGet, plain, nil, guest), http.StatusOK) // public, now cached

	// Deleting the only public record makes the file private at once, not after the cache expires.
	expectStatus(t, env.do(http.MethodDelete, "/api/moul/builds/records/"+build["id"].(string), nil, withAdminKey()), http.StatusNoContent)
	expectStatus(t, env.do(http.MethodGet, plain, nil, guest), http.StatusNotFound)

	// A request header cannot make a file public for everyone.
	shared := &schema.Moul{ID: "moul_shared", Name: "shared", Type: "base",
		Fields: []schema.MoulField{{Name: "doc", Type: "file"}},
		Rules:  schema.MoulRules{ViewRule: "@request.headers.x_share = 'yes'"}}
	if err := db.SaveMoulMetadata(env.db, shared); err != nil {
		t.Fatal(err)
	}
	if err := db.CreateMoulTable(env.db, shared); err != nil {
		t.Fatal(err)
	}
	doc := uploaded(t, env.upload("doc.png", "image/png", pngBytes(t), withAdminKey()))
	expectStatus(t, env.do(http.MethodPost, "/api/moul/shared/records", map[string]interface{}{"doc": doc}, withAdminKey()), http.StatusCreated)
	docPath := storagePathOf(doc["url"].(string))
	expectStatus(t, env.do(http.MethodGet, docPath, nil, caller{headers: map[string]string{"X-Share": "yes"}}), http.StatusNotFound)
	expectStatus(t, env.do(http.MethodGet, docPath, nil, guest), http.StatusNotFound)

	// Deleting a collection drops its file references.
	expectStatus(t, env.do(http.MethodDelete, "/api/moul/shared", nil, withAdminKey()), http.StatusNoContent)
	var count int
	if err := env.db.NewQuery("SELECT COUNT(*) FROM _file_refs WHERE moul = 'shared'").Row(&count); err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Fatalf("%d file references survived the collection", count)
	}
}
