package storage

import (
	"bytes"
	"image"
	"image/color"
	"image/jpeg"
	"math/rand/v2"
	"testing"

	"github.com/disintegration/imaging"
)

// photoLikeJPEG encodes a w×h image with gradients and noise, so it compresses and resizes like a
// camera photo rather than a flat color.
func photoLikeJPEG(tb testing.TB, w, h int) []byte {
	tb.Helper()
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	rng := rand.New(rand.NewPCG(1, 2))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			n := uint8(rng.IntN(32))
			img.SetRGBA(x, y, color.RGBA{R: uint8(x*255/w) ^ n, G: uint8(y*255/h) + n, B: uint8((x + y) * 255 / (w + h)), A: 255})
		}
	}
	var buf bytes.Buffer
	if err := jpeg.Encode(&buf, img, &jpeg.Options{Quality: 85}); err != nil {
		tb.Fatalf("encode: %v", err)
	}
	return buf.Bytes()
}

// BenchmarkResizeFilters measures decoding a 12 MP JPEG and producing the sm/md/lg renditions
// with each candidate filter (go test -bench ResizeFilters -run ^$ ./internal/storage).
func BenchmarkResizeFilters(b *testing.B) {
	data := photoLikeJPEG(b, 4000, 3000)
	filters := []struct {
		name   string
		filter imaging.ResampleFilter
	}{
		{"Lanczos", imaging.Lanczos},
		{"CatmullRom", imaging.CatmullRom},
		{"Linear", imaging.Linear},
		{"Box", imaging.Box},
	}
	for _, f := range filters {
		for _, cascade := range []bool{false, true} {
			name := f.name + "/fromOriginal"
			if cascade {
				name = f.name + "/cascade"
			}
			b.Run(name, func(b *testing.B) {
				for i := 0; i < b.N; i++ {
					img, _, err := image.Decode(bytes.NewReader(data))
					if err != nil {
						b.Fatal(err)
					}
					src := img
					for _, size := range []int{2048, 1024, 256} {
						resized := imaging.Fit(src, size, size, f.filter)
						if cascade {
							src = resized
						}
						var out bytes.Buffer
						if err := imaging.Encode(&out, resized, imaging.JPEG); err != nil {
							b.Fatal(err)
						}
					}
				}
			})
		}
	}
}

// BenchmarkDecodeOnly is the floor every rendition strategy pays: decoding the 12 MP original.
func BenchmarkDecodeOnly(b *testing.B) {
	data := photoLikeJPEG(b, 4000, 3000)
	for i := 0; i < b.N; i++ {
		if _, _, err := image.Decode(bytes.NewReader(data)); err != nil {
			b.Fatal(err)
		}
	}
}
