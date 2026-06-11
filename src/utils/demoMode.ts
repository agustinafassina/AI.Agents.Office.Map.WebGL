/** ?demo=1 — faster peer chats and looser pairing for README / GIF recording. */
export function isDemoRecordingMode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('demo') === '1';
}
