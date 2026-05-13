function cleanSignalText(text) {
  return String(text || '')
    .trim()
    .replace(/^\*\*\s*/, '')
    .replace(/\s*\*\*$/, '')
    .replace(/^["'“”]+/, '')
    .replace(/["'“”]+$/, '')
    .trim();
}

export function extractReportSignal(line) {
  const normalized = String(line || '')
    .replace(/^[-*]\s+/, '')
    .replace(/^\d+\.\s+/, '')
    .trim();
  const match = normalized.match(/^\*{0,2}\s*(한\s*문장\s*결론|한문장\s*결론|한\s*문장\s*정리|한문장\s*정리|한\s*문장\s*제안|한문장\s*제안)\s*\*{0,2}\s*[:：]\s*(.+)$/);
  if (!match) return null;

  const label = match[1].replace(/\s+/g, '');
  const text = cleanSignalText(match[2]);
  if (!text) return null;
  if (label.includes('결론')) return { kind: 'conclusion', label: '한 문장 결론', text };
  if (label.includes('제안')) return { kind: 'suggestion', label: '한문장 제안', text };
  return { kind: 'summary', label: '한문장 정리', text };
}
