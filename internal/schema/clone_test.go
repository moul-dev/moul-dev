package schema

import (
	"reflect"
	"testing"
)

// fillAll sets every field reachable from v to a non-zero value, allocating slices (of one
// element), maps and pointers along the way.
func fillAll(t *testing.T, v reflect.Value) {
	t.Helper()
	switch v.Kind() {
	case reflect.Ptr:
		if v.IsNil() {
			v.Set(reflect.New(v.Type().Elem()))
		}
		fillAll(t, v.Elem())
	case reflect.Struct:
		for i := 0; i < v.NumField(); i++ {
			if v.Type().Field(i).IsExported() {
				fillAll(t, v.Field(i))
			}
		}
	case reflect.Slice:
		v.Set(reflect.MakeSlice(v.Type(), 1, 1))
		fillAll(t, v.Index(0))
	case reflect.Map:
		m := reflect.MakeMap(v.Type())
		key := reflect.New(v.Type().Key()).Elem()
		fillAll(t, key)
		val := reflect.New(v.Type().Elem()).Elem()
		fillAll(t, val)
		m.SetMapIndex(key, val)
		v.Set(m)
	case reflect.String:
		v.SetString("x")
	case reflect.Bool:
		v.SetBool(true)
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		v.SetInt(1)
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		v.SetUint(1)
	case reflect.Float32, reflect.Float64:
		v.SetFloat(1)
	case reflect.Interface:
		v.Set(reflect.ValueOf("x"))
	default:
		t.Fatalf("fillAll: unsupported kind %s", v.Kind())
	}
}

// assertNoSharing fails when a and b (equal values) share any slice array, map or pointer.
func assertNoSharing(t *testing.T, path string, a, b reflect.Value) {
	t.Helper()
	switch a.Kind() {
	case reflect.Ptr:
		if a.IsNil() {
			return
		}
		if a.Pointer() == b.Pointer() {
			t.Errorf("%s: pointer is shared between the original and the clone", path)
			return
		}
		assertNoSharing(t, path, a.Elem(), b.Elem())
	case reflect.Struct:
		for i := 0; i < a.NumField(); i++ {
			if a.Type().Field(i).IsExported() {
				assertNoSharing(t, path+"."+a.Type().Field(i).Name, a.Field(i), b.Field(i))
			}
		}
	case reflect.Slice:
		if a.Len() == 0 {
			return
		}
		if a.Pointer() == b.Pointer() {
			t.Errorf("%s: slice is shared between the original and the clone", path)
			return
		}
		for i := 0; i < a.Len(); i++ {
			assertNoSharing(t, path+"[]", a.Index(i), b.Index(i))
		}
	case reflect.Map:
		if a.Len() > 0 && a.Pointer() == b.Pointer() {
			t.Errorf("%s: map is shared between the original and the clone", path)
		}
	}
}

func TestCloneSharesNothing(t *testing.T) {
	orig := &Moul{}
	fillAll(t, reflect.ValueOf(orig))

	clone := orig.Clone()
	if !reflect.DeepEqual(orig, clone) {
		t.Fatal("clone must equal the original")
	}
	assertNoSharing(t, "Moul", reflect.ValueOf(orig), reflect.ValueOf(clone))
}

func TestCloneNil(t *testing.T) {
	var m *Moul
	if m.Clone() != nil {
		t.Fatal("cloning nil must return nil")
	}
	empty := (&Moul{Name: "posts"}).Clone()
	if empty.Fields != nil || empty.Webhooks != nil || empty.EmailTemplates != nil {
		t.Fatal("nil slices and pointers must stay nil")
	}
}
