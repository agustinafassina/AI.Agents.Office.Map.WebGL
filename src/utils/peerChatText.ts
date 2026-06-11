export function stripMarkdownForBubble(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

export function truncateForBubble(text: string, max = 72): string {
  const plain = stripMarkdownForBubble(text);
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1)}…`;
}
