/**
 * XSS mitigation: escape HTML special characters before rendering user content
 */

const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
};

export function escapeHtml(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return '';
  const str = String(text);
  return str.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE[char] ?? char);
}
