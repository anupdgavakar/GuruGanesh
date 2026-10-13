<?php

namespace Tests\Unit;

use App\Services\ImageOptimizer;
use PHPUnit\Framework\TestCase;

class ImageOptimizerTest extends TestCase
{
    private array $temps = [];

    protected function tearDown(): void
    {
        foreach ($this->temps as $f) {
            @unlink($f);
        }
    }

    private function photo(int $w, int $h, string $format = 'jpeg', int $quality = 100): string
    {
        $img = imagecreatetruecolor($w, $h);
        mt_srand(7);
        for ($y = 0; $y < $h; $y += 4) {
            for ($x = 0; $x < $w; $x += 4) {
                $c = imagecolorallocate($img, ($x * 255 / $w) | 0, ($y * 255 / $h) | 0, mt_rand(0, 255));
                imagefilledrectangle($img, $x, $y, $x + 3, $y + 3, $c);
            }
        }
        $path = tempnam(sys_get_temp_dir(), 'src').'.'.($format === 'jpeg' ? 'jpg' : $format);
        match ($format) {
            'jpeg' => imagejpeg($img, $path, $quality),
            'png' => imagepng($img, $path, 0),
            'webp' => imagewebp($img, $path, $quality),
        };
        imagedestroy($img);

        return $this->temps[] = $path;
    }

    public function test_large_jpeg_is_scaled_down_and_smaller(): void
    {
        $src = $this->photo(3600, 2400);
        $out = (new ImageOptimizer())->optimize($src);

        $this->assertNotNull($out);
        $this->temps[] = $out['path'];
        $this->assertSame('jpg', $out['extension']);
        [$w, $h] = getimagesize($out['path']);
        $this->assertSame(2400, $w);
        $this->assertSame(1600, $h);
        $this->assertLessThan(filesize($src), filesize($out['path']));
    }

    public function test_small_image_is_left_alone(): void
    {
        $src = $this->photo(300, 200, 'jpeg', 80);

        $this->assertNull((new ImageOptimizer())->optimize($src));
    }

    public function test_never_upscales(): void
    {
        $src = $this->photo(1800, 1200, 'jpeg', 100);
        $out = (new ImageOptimizer())->optimize($src);

        if ($out) {
            $this->temps[] = $out['path'];
            [$w] = getimagesize($out['path']);
            $this->assertLessThanOrEqual(1800, $w);
        }
        $this->assertTrue(true);
    }

    public function test_transparent_png_stays_png_with_alpha(): void
    {
        $img = imagecreatetruecolor(2600, 1000);
        imagealphablending($img, false);
        imagesavealpha($img, true);
        imagefill($img, 0, 0, imagecolorallocatealpha($img, 0, 0, 0, 127));
        imagefilledellipse($img, 1300, 500, 900, 700, imagecolorallocatealpha($img, 200, 30, 30, 0));
        $src = tempnam(sys_get_temp_dir(), 'src').'.png';
        imagepng($img, $src, 0);
        $this->temps[] = $src;

        $out = (new ImageOptimizer())->optimize($src);

        $this->assertNotNull($out);
        $this->temps[] = $out['path'];
        $this->assertSame('png', $out['extension']);
        $copy = imagecreatefrompng($out['path']);
        $this->assertSame(127, (imagecolorat($copy, 5, 5) >> 24) & 0x7F, 'corner should still be transparent');
    }

    public function test_solid_png_photo_becomes_jpeg(): void
    {
        // photo-like: smooth gradients plus per-pixel grain, which PNG compresses badly
        $img = imagecreatetruecolor(1600, 1200);
        mt_srand(3);
        for ($y = 0; $y < 1200; $y++) {
            for ($x = 0; $x < 1600; $x++) {
                $n = mt_rand(-12, 12);
                imagesetpixel($img, $x, $y, (max(0, min(255, (int) ($x * 255 / 1600) + $n)) << 16)
                    | (max(0, min(255, (int) ($y * 255 / 1200) + $n)) << 8)
                    | max(0, min(255, 128 + $n)));
            }
        }
        $src = tempnam(sys_get_temp_dir(), 'src').'.png';
        imagepng($img, $src, 6);
        $this->temps[] = $src;
        $out = (new ImageOptimizer())->optimize($src);

        $this->assertNotNull($out);
        $this->temps[] = $out['path'];
        $this->assertSame('jpg', $out['extension']);
        $this->assertLessThan(filesize($src) / 3, filesize($out['path']));
    }

    public function test_png_saved_with_alpha_but_fully_solid_becomes_jpeg(): void
    {
        // Common export: RGBA PNG (colour type 6) where every pixel is opaque.
        $img = imagecreatetruecolor(1024, 1024);
        imagealphablending($img, false);
        imagesavealpha($img, true);
        mt_srand(5);
        for ($y = 0; $y < 1024; $y++) {
            for ($x = 0; $x < 1024; $x++) {
                $n = mt_rand(-14, 14);
                imagesetpixel($img, $x, $y, (max(0, min(255, (int) (120 + 100 * sin($x / 90) + $n))) << 16)
                    | (max(0, min(255, (int) (120 + 100 * cos($y / 70) + $n))) << 8)
                    | max(0, min(255, 140 + $n)));
            }
        }
        $src = tempnam(sys_get_temp_dir(), 'src').'.png';
        imagepng($img, $src, 6);
        $this->temps[] = $src;
        $this->assertSame(6, ord(file_get_contents($src)[25]), 'fixture should be RGBA');
        $this->assertGreaterThan(400 * 1024, filesize($src), 'fixture should be a heavy PNG');

        $out = (new ImageOptimizer())->optimize($src);

        $this->assertNotNull($out);
        $this->temps[] = $out['path'];
        $this->assertSame('jpg', $out['extension']);
        $this->assertLessThan(filesize($src) / 2, filesize($out['path']));
    }

    public function test_non_images_and_garbage_are_ignored(): void
    {
        $f = tempnam(sys_get_temp_dir(), 'txt');
        file_put_contents($f, str_repeat('not an image', 100000));
        $this->temps[] = $f;

        $this->assertNull((new ImageOptimizer())->optimize($f));
        $this->assertNull((new ImageOptimizer())->optimize('/nonexistent/file.jpg'));
    }
}
