/**
 * Lightweight markdown-to-HTML parser for NyayBot responses.
 * Handles: **bold**, *italic*, - list items, --- hr, headings, and line breaks.
 */
export function parseMarkdown(text) {
  if (!text) return "";

  let html = text
    // Escape HTML entities
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Horizontal rules
    .replace(/^---+$/gm, '<hr class="md-hr" />')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic (single *)
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Numbered list items
    .replace(/^(\d+)\.\s+(.+)$/gm, '<li class="md-ol">$2</li>')
    // Bullet list items
    .replace(/^[-•]\s+(.+)$/gm, '<li class="md-li">$1</li>')
    // Line breaks
    .replace(/\n/g, "<br />");

  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/((?:<li class="md-li">.*?<\/li><br \/>?)+)/g, (match) => {
    const cleaned = match.replace(/<br \/>/g, "");
    return `<ul class="md-ul">${cleaned}</ul>`;
  });

  html = html.replace(/((?:<li class="md-ol">.*?<\/li><br \/>?)+)/g, (match) => {
    const cleaned = match.replace(/<br \/>/g, "");
    return `<ol class="md-ol-list">${cleaned}</ol>`;
  });

  return html;
}
