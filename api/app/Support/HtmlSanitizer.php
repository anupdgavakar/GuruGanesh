<?php

namespace App\Support;

/**
 * Cleans blog HTML before it is saved, so the storefront can safely show it
 * as rich text. Only simple writing tags are kept (headings, paragraphs,
 * bold/italic/underline, lists, quotes, links, images); scripts, styles,
 * iframes, event handlers (onclick=...) and javascript: links are removed.
 * Plain text without any tags is turned into paragraphs.
 *
 * Plain PHP (DOMDocument), no extra packages.
 */
class HtmlSanitizer
{
    /** tag => attributes allowed on it */
    private const ALLOWED = [
        'p' => [], 'br' => [], 'hr' => [],
        'h2' => [], 'h3' => [], 'h4' => [],
        'strong' => [], 'em' => [], 'u' => [],
        'ul' => [], 'ol' => [], 'li' => [],
        'blockquote' => [],
        'a' => ['href'],
        'img' => ['src', 'alt'],
    ];

    /** renamed instead of dropped */
    private const RENAME = ['b' => 'strong', 'i' => 'em', 'h1' => 'h2', 'h5' => 'h4', 'h6' => 'h4'];

    /** removed together with everything inside them */
    private const DROP_WITH_CONTENT = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'noscript', 'svg', 'math', 'link', 'meta', 'title', 'head', 'template'];

    public static function clean(?string $html): string
    {
        $html = trim((string) $html);
        if ($html === '') {
            return '';
        }

        if (! str_contains($html, '<')) {
            return self::paragraphs($html);
        }

        $previous = libxml_use_internal_errors(true);
        $doc = new \DOMDocument('1.0', 'UTF-8');
        $doc->loadHTML('<?xml encoding="utf-8"?><div id="root">'.$html.'</div>', LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_NONET);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $doc->getElementById('root');
        if (! $root) {
            return self::paragraphs(strip_tags($html));
        }

        self::walk($root);
        self::wrapLooseInline($root);

        $out = '';
        foreach ($root->childNodes as $child) {
            $out .= $doc->saveHTML($child);
        }

        return trim($out);
    }

    private static function walk(\DOMNode $node): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child instanceof \DOMComment) {
                $node->removeChild($child);
                continue;
            }

            if (! $child instanceof \DOMElement) {
                continue;
            }

            $tag = strtolower($child->tagName);

            if (in_array($tag, self::DROP_WITH_CONTENT, true)) {
                $node->removeChild($child);
                continue;
            }

            self::walk($child);

            $tag = self::RENAME[$tag] ?? $tag;

            if (! isset(self::ALLOWED[$tag])) {
                // Unknown wrapper (div, span, font...): keep the text/children, drop the tag.
                while ($child->firstChild) {
                    $node->insertBefore($child->firstChild, $child);
                }
                $node->removeChild($child);
                continue;
            }

            if ($tag !== strtolower($child->tagName)) {
                $renamed = $child->ownerDocument->createElement($tag);
                while ($child->firstChild) {
                    $renamed->appendChild($child->firstChild);
                }
                $node->replaceChild($renamed, $child);
                $child = $renamed;
            }

            self::cleanAttributes($child, $tag);
        }
    }

    /** Text and inline tags sitting directly at the top level get a <p> around them. */
    private static function wrapLooseInline(\DOMElement $root): void
    {
        $inline = ['strong', 'em', 'u', 'a', 'br', 'img'];
        $run = [];

        $flush = function () use (&$run, $root) {
            if ($run === []) {
                return;
            }
            $text = '';
            foreach ($run as $n) {
                $text .= $n->textContent;
            }
            if (trim($text) === '' && ! array_filter($run, fn ($n) => $n instanceof \DOMElement && $n->tagName === 'img')) {
                foreach ($run as $n) {
                    $root->removeChild($n);
                }
            } else {
                $p = $root->ownerDocument->createElement('p');
                $root->insertBefore($p, $run[0]);
                foreach ($run as $n) {
                    $p->appendChild($n);
                }
            }
            $run = [];
        };

        foreach (iterator_to_array($root->childNodes) as $child) {
            $isInline = $child instanceof \DOMText
                || ($child instanceof \DOMElement && in_array(strtolower($child->tagName), $inline, true));

            if ($isInline) {
                $run[] = $child;
            } else {
                $flush();
            }
        }
        $flush();
    }

    private static function cleanAttributes(\DOMElement $el, string $tag): void
    {
        $allowed = self::ALLOWED[$tag];

        foreach (iterator_to_array($el->attributes) as $attr) {
            $name = strtolower($attr->name);

            if (! in_array($name, $allowed, true)) {
                $el->removeAttribute($attr->name);
                continue;
            }

            if (($name === 'href' || $name === 'src') && ! self::safeUrl($attr->value, $name === 'src')) {
                $el->removeAttribute($attr->name);
            }
        }

        if ($tag === 'a') {
            if (! $el->hasAttribute('href')) {
                // A link with no usable address is just its text.
                $text = $el->ownerDocument->createTextNode($el->textContent);
                $el->parentNode?->replaceChild($text, $el);

                return;
            }
            if (preg_match('#^https?://#i', $el->getAttribute('href'))) {
                $el->setAttribute('target', '_blank');
            }
            $el->setAttribute('rel', 'noopener noreferrer');
        }

        if ($tag === 'img' && ! $el->hasAttribute('src')) {
            $el->parentNode?->removeChild($el);
        }
    }

    private static function safeUrl(string $url, bool $isImage): bool
    {
        $url = trim(preg_replace('/[\x00-\x20]+/', '', $url) ?? '');

        if ($url === '') {
            return false;
        }

        $schemes = $isImage ? ['http', 'https'] : ['http', 'https', 'mailto', 'tel'];

        if (preg_match('#^([a-z][a-z0-9+.-]*):#i', $url, $m)) {
            return in_array(strtolower($m[1]), $schemes, true);
        }

        // Relative address, "#section" or "/path" (but not "//host" tricks with odd schemes).
        return true;
    }

    /**
     * Plain text (no tags) -> readable HTML. Besides paragraphs, it recognises
     * the usual shapes of an article typed or pasted as plain text:
     *   "1. Business Printing"            -> small heading
     *   "Why Choose Us?" (short, no stop) -> heading
     *   "Label: a full sentence."         -> bullet list item with bold label
     */
    private static function paragraphs(string $text): string
    {
        $blocks = array_values(array_filter(
            array_map('trim', preg_split('/\R{2,}/', trim($text)) ?: []),
            fn ($b) => $b !== '',
        ));

        $out = [];
        $list = [];
        $flush = function () use (&$out, &$list) {
            if ($list) {
                $out[] = '<ul>'.implode('', $list).'</ul>';
                $list = [];
            }
        };

        foreach ($blocks as $i => $block) {
            $singleLine = ! preg_match('/\R/', $block);
            $escaped = e($block);

            if ($singleLine && preg_match('/^([^.:?!]{2,45}):\s+(.{30,})$/u', $block, $m) && preg_match('/[.!?]$/', $block)) {
                $list[] = '<li><strong>'.e($m[1]).':</strong> '.e($m[2]).'</li>';
                continue;
            }

            $flush();

            $hasNext = isset($blocks[$i + 1]);
            $short = mb_strlen($block) <= 90;
            if ($singleLine && $short && $hasNext && preg_match('/^\d{1,2}[.)]\s+\S/u', $block)) {
                $out[] = '<h3>'.$escaped.'</h3>';
            } elseif ($singleLine && $short && $hasNext && ! preg_match('/[.,;:!]$/', $block) && ! (str_ends_with($block, '?') && mb_strlen($block) > 60)) {
                $out[] = '<h2>'.$escaped.'</h2>';
            } else {
                $out[] = '<p>'.nl2br($escaped, false).'</p>';
            }
        }
        $flush();

        return implode("\n", $out);
    }

    /** True when the saved text has no HTML tags at all (older posts). */
    public static function isPlainText(?string $value): bool
    {
        return trim((string) $value) !== '' && ! str_contains((string) $value, '<');
    }
}
