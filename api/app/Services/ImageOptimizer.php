<?php

namespace App\Services;

/**
 * Shrinks big photos before they are stored, without a visible loss.
 *
 * What it does, and what it deliberately does not:
 *  - Only JPEG, PNG and WebP are touched. GIF, SVG, animated images, CMYK
 *    JPEGs and anything it cannot read are left exactly as uploaded.
 *  - Pictures wider/taller than `maxEdge` px are scaled down (never up),
 *    keeping the shape. 2400 px is twice the largest size the shop shows a
 *    picture at, so it still looks sharp on high-density screens.
 *  - JPEGs are re-saved at high quality (default 86), progressive, with the
 *    camera's rotation applied and the colour profile copied across so
 *    colours stay the same.
 *  - Transparent PNGs stay PNG (transparency kept). A solid PNG photo is
 *    turned into a JPEG only when that is clearly smaller; flat artwork like
 *    logos stays PNG.
 *  - The result is used only if it is really smaller; otherwise the
 *    original is kept. Any problem means "keep the original" — an upload
 *    never fails because of this.
 *
 * Plain PHP + GD, no framework classes, so it can be tested on its own.
 */
class ImageOptimizer
{
    public function __construct(
        private readonly int $maxEdge = 2400,
        private readonly int $jpegQuality = 86,
        private readonly int $webpQuality = 85,
        /** Pictures at or under this size and within maxEdge are left alone. */
        private readonly int $leaveAloneBelowBytes = 400 * 1024,
        /** Only swap in the new file if it is at least this much smaller (0.95 = 5% smaller). */
        private readonly float $mustBeSmallerThan = 0.95,
    ) {
    }

    /**
     * @return array{path: string, extension: string}|null a NEW temporary file with the
     *         optimised picture (caller must delete it), or null to keep the original.
     */
    public function optimize(string $sourcePath): ?array
    {
        try {
            return $this->run($sourcePath);
        } catch (\Throwable) {
            return null;
        }
    }

    private function run(string $sourcePath): ?array
    {
        if (! extension_loaded('gd') || ! is_file($sourcePath)) {
            return null;
        }

        $info = @getimagesize($sourcePath);
        if ($info === false) {
            return null;
        }

        [$width, $height, $type] = $info;
        if (! in_array($type, [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true) || $width < 1 || $height < 1) {
            return null;
        }

        $originalBytes = filesize($sourcePath);
        $needsResize = max($width, $height) > $this->maxEdge;

        if (! $needsResize && $originalBytes < $this->leaveAloneBelowBytes) {
            return null;
        }

        $raw = file_get_contents($sourcePath);
        if ($raw === false) {
            return null;
        }

        // Animated and CMYK pictures cannot be re-encoded faithfully with GD.
        if ($type === IMAGETYPE_JPEG && ($info['channels'] ?? 3) === 4) {
            return null;
        }
        if ($type === IMAGETYPE_WEBP && str_contains(substr($raw, 0, 4096), 'ANIM')) {
            return null;
        }
        if ($type === IMAGETYPE_PNG && str_contains(substr($raw, 0, 4096), 'acTL')) {
            return null;
        }

        $restoreMemory = $this->allowMemoryFor($width, $height);

        try {
            $image = match ($type) {
                IMAGETYPE_JPEG => @imagecreatefromstring($raw),
                IMAGETYPE_PNG => @imagecreatefromstring($raw),
                IMAGETYPE_WEBP => @imagecreatefromstring($raw),
            };
            if (! $image) {
                return null;
            }

            if ($type === IMAGETYPE_JPEG) {
                $image = $this->applyExifRotation($image, $sourcePath);
            }

            $image = $this->scaleDown($image);

            $result = match ($type) {
                IMAGETYPE_JPEG => $this->encodeJpeg($image, $this->iccSegments($raw)),
                IMAGETYPE_WEBP => ['bytes' => $this->capture(fn () => imagewebp($image, null, $this->webpQuality)), 'extension' => 'webp'],
                IMAGETYPE_PNG => $this->encodePng($image, $raw),
            };
            imagedestroy($image);

            $bytes = $result['bytes'] ?? '';
            if ($bytes === '' || $bytes === false) {
                return null;
            }

            $smallerEnough = strlen($bytes) < $originalBytes * $this->mustBeSmallerThan;
            $resizedAndSmaller = $needsResize && strlen($bytes) < $originalBytes;
            if (! $smallerEnough && ! $resizedAndSmaller) {
                return null;
            }

            $temp = tempnam(sys_get_temp_dir(), 'img');
            file_put_contents($temp, $bytes);

            return ['path' => $temp, 'extension' => $result['extension']];
        } finally {
            $restoreMemory();
        }
    }

    /** Scales down to maxEdge on the long side; returns the same image when no scaling is needed. */
    private function scaleDown(\GdImage $image): \GdImage
    {
        $w = imagesx($image);
        $h = imagesy($image);
        $longest = max($w, $h);

        if ($longest <= $this->maxEdge) {
            return $image;
        }

        $ratio = $this->maxEdge / $longest;
        $newW = max(1, (int) round($w * $ratio));
        $newH = max(1, (int) round($h * $ratio));

        $scaled = imagecreatetruecolor($newW, $newH);
        imagealphablending($scaled, false);
        imagesavealpha($scaled, true);
        imagefill($scaled, 0, 0, imagecolorallocatealpha($scaled, 0, 0, 0, 127));
        imagecopyresampled($scaled, $image, 0, 0, 0, 0, $newW, $newH, $w, $h);
        imagedestroy($image);

        return $scaled;
    }

    /** Phones store photos sideways with a rotation note; GD ignores the note, so apply it. */
    private function applyExifRotation(\GdImage $image, string $path): \GdImage
    {
        if (! function_exists('exif_read_data')) {
            return $image;
        }

        $exif = @exif_read_data($path);
        $orientation = (int) ($exif['Orientation'] ?? 1);

        $fixed = match ($orientation) {
            2 => $this->flip($image, IMG_FLIP_HORIZONTAL),
            3 => imagerotate($image, 180, 0),
            4 => $this->flip($image, IMG_FLIP_VERTICAL),
            5 => $this->flip(imagerotate($image, -90, 0) ?: $image, IMG_FLIP_HORIZONTAL),
            6 => imagerotate($image, -90, 0),
            7 => $this->flip(imagerotate($image, 90, 0) ?: $image, IMG_FLIP_HORIZONTAL),
            8 => imagerotate($image, 90, 0),
            default => $image,
        };

        return $fixed instanceof \GdImage ? $fixed : $image;
    }

    private function flip(\GdImage $image, int $mode): \GdImage
    {
        imageflip($image, $mode);

        return $image;
    }

    /** @return array{bytes: string, extension: string} */
    private function encodeJpeg(\GdImage $image, string $iccSegments): array
    {
        $this->flattenAlpha($image);
        imageinterlace($image, true); // progressive: loads gradually and is usually smaller

        $bytes = $this->capture(fn () => imagejpeg($image, null, $this->jpegQuality));

        return ['bytes' => $this->injectIcc($bytes, $iccSegments), 'extension' => 'jpg'];
    }

    /** @return array{bytes: string, extension: string} */
    private function encodePng(\GdImage $image, string $raw): array
    {
        $hasTransparency = $this->pngHasTransparency($raw, $image);

        imagealphablending($image, false);
        imagesavealpha($image, true);
        $png = $this->capture(fn () => imagepng($image, null, 9));

        if ($hasTransparency) {
            return ['bytes' => $png, 'extension' => 'png'];
        }

        // A solid picture: photos are far smaller as JPEG, flat artwork is not.
        $copy = imagecreatetruecolor(imagesx($image), imagesy($image));
        imagecopy($copy, $image, 0, 0, 0, 0, imagesx($image), imagesy($image));
        imageinterlace($copy, true);
        $jpeg = $this->capture(fn () => imagejpeg($copy, null, $this->jpegQuality));
        imagedestroy($copy);

        if ($jpeg !== '' && strlen($jpeg) < strlen($png) * 0.6) {
            return ['bytes' => $this->injectIcc($jpeg, $this->iccSegments($raw)), 'extension' => 'jpg'];
        }

        return ['bytes' => $png, 'extension' => 'png'];
    }

    /**
     * True only if some pixel really is see-through. Many PNGs are saved with
     * an alpha channel (colour type 6) even though every pixel is solid; the
     * header alone can't tell, so the pixels are checked. Stops at the first
     * see-through pixel.
     */
    private function pngHasTransparency(string $raw, \GdImage $image): bool
    {
        if (strlen($raw) < 26) {
            return true; // be safe: treat as transparent, keep PNG
        }

        $colourType = ord($raw[25]);
        $mayHaveAlpha = $colourType === 4 || $colourType === 6 || str_contains(substr($raw, 0, 8192), 'tRNS');

        if (! $mayHaveAlpha) {
            return false;
        }

        if (! imageistruecolor($image)) {
            imagepalettetotruecolor($image);
        }

        $w = imagesx($image);
        $h = imagesy($image);

        for ($y = 0; $y < $h; $y++) {
            for ($x = 0; $x < $w; $x++) {
                // GD alpha: 0 = solid, 127 = fully see-through. Allow a hair of rounding.
                if (((imagecolorat($image, $x, $y) >> 24) & 0x7F) > 2) {
                    return true;
                }
            }
        }

        return false;
    }

    /** Paints any transparency onto white so a JPEG (which has none) doesn't turn black. */
    private function flattenAlpha(\GdImage &$image): void
    {
        $w = imagesx($image);
        $h = imagesy($image);
        $flat = imagecreatetruecolor($w, $h);
        imagefill($flat, 0, 0, imagecolorallocate($flat, 255, 255, 255));
        imagealphablending($flat, true);
        imagecopy($flat, $image, 0, 0, 0, 0, $w, $h);
        imagedestroy($image);
        $image = $flat;
    }

    /** The colour-profile (ICC) pieces of a JPEG, to be copied into the new file. */
    private function iccSegments(string $raw): string
    {
        if (strlen($raw) < 4 || $raw[0] !== "\xFF" || $raw[1] !== "\xD8") {
            return '';
        }

        $segments = '';
        $pos = 2;
        $length = strlen($raw);

        while ($pos + 4 <= $length && $raw[$pos] === "\xFF") {
            $marker = ord($raw[$pos + 1]);
            if ($marker === 0xDA || $marker === 0xD9) {
                break; // start of scan / end of image: no more headers
            }
            $size = (ord($raw[$pos + 2]) << 8) | ord($raw[$pos + 3]);
            if ($size < 2 || $pos + 2 + $size > $length) {
                break;
            }
            if ($marker === 0xE2 && substr($raw, $pos + 4, 12) === "ICC_PROFILE\0") {
                $segments .= substr($raw, $pos, 2 + $size);
            }
            $pos += 2 + $size;
        }

        return $segments;
    }

    private function injectIcc(string $jpeg, string $segments): string
    {
        if ($segments === '' || strlen($jpeg) < 4 || $jpeg[0] !== "\xFF" || $jpeg[1] !== "\xD8") {
            return $jpeg;
        }

        // GD writes SOI then a JFIF (APP0) segment; the profile goes straight after it.
        $offset = 2;
        if ($jpeg[2] === "\xFF" && $jpeg[3] === "\xE0") {
            $offset = 2 + 2 + ((ord($jpeg[4]) << 8) | ord($jpeg[5]));
        }

        return substr($jpeg, 0, $offset).$segments.substr($jpeg, $offset);
    }

    private function capture(callable $encode): string
    {
        ob_start();
        $encode();

        return (string) ob_get_clean();
    }

    /** Big photos need a lot of memory to decode (about 4 bytes a pixel, twice). Raise the limit just for this call. */
    private function allowMemoryFor(int $width, int $height): callable
    {
        $needed = (int) ($width * $height * 4 * 2.2) + 32 * 1024 * 1024;
        $current = $this->bytes((string) ini_get('memory_limit'));

        if ($current === -1 || $current >= $needed + memory_get_usage()) {
            return static function (): void {};
        }

        $original = (string) ini_get('memory_limit');
        @ini_set('memory_limit', (string) ($needed + memory_get_usage()));

        return static function () use ($original): void {
            @ini_set('memory_limit', $original);
        };
    }

    private function bytes(string $value): int
    {
        $value = trim($value);
        if ($value === '-1' || $value === '') {
            return -1;
        }
        $number = (int) $value;

        return match (strtolower(substr($value, -1))) {
            'g' => $number * 1024 ** 3,
            'm' => $number * 1024 ** 2,
            'k' => $number * 1024,
            default => $number,
        };
    }
}
