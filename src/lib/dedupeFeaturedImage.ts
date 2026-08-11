/** Strip WordPress size suffixes so original and resized URLs compare equal. */
export function normalizeUploadSrc(src: string): string {
  return src
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/-\d+x\d+(?=\.[a-z0-9]+$)/i, '')
    .replace(/-scaled(?=\.[a-z0-9]+$)/i, '');
}

/**
 * Elementor single-post templates render the featured image widget and often
 * the same photo again as the first block in post content. Drop that lead
 * body image when it matches the featured image.
 */
export function dedupeFeaturedContentImage(html: string): string {
  const featuredMatch = html.match(
    /theme-post-featured-image[\s\S]*?<img\b[^>]*\ssrc="([^"]+)"/i
  );
  if (!featuredMatch) return html;

  const featuredNorm = normalizeUploadSrc(featuredMatch[1]);

  return html.replace(
    /(theme-post-content[\s\S]*?<div class="elementor-widget-container">\s*)(?:<figure\b[^>]*\bwp-block-image\b[^>]*>[\s\S]*?<\/figure>|<img\b[^>]*>)/i,
    (match, prefix: string) => {
      const src = match.slice(prefix.length).match(/\ssrc="([^"]+)"/i)?.[1];
      if (!src || normalizeUploadSrc(src) !== featuredNorm) return match;
      return prefix;
    }
  );
}
