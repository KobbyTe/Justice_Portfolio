import DOMPurify from 'dompurify';

/**
 * Sanitizes rich-text HTML before it is injected into the DOM.
 * Blocks scripts, event handlers, iframes and javascript: URLs (XSS).
 */
export const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html ?? '', {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'hr',
      'span', 'div', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class'],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|data:image\/(?:png|jpeg|gif|webp);|#|\/)/i,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'style'],
  });

/** Escapes a plain-text string for safe HTML interpolation. */
export const escapeHtml = (input: string): string =>
  (input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
