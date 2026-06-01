export function createId(prefix = 'id'): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
