function readBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

/** Browser must use a same-origin path in dev so Vite can proxy LiteLLM (avoids CORS). */
function resolveLitellmBaseUrl(): string {
  const raw = import.meta.env.VITE_LITELLM_BASE_URL?.trim();
  if (!raw) return '/api/litellm';
  if (import.meta.env.DEV && /^https?:\/\//i.test(raw)) {
    console.warn(
      '[office-map] VITE_LITELLM_BASE_URL is an absolute URL in dev; routing via /api/litellm proxy instead.',
    );
    return '/api/litellm';
  }
  return raw;
}

export const env = {
  litellmBaseUrl: resolveLitellmBaseUrl(),
  litellmApiKey: import.meta.env.VITE_LITELLM_API_KEY?.trim() || '',
  useMockLitellm: readBool(import.meta.env.VITE_USE_MOCK_LITELLM, true),
  enableAgentPeerChat: readBool(import.meta.env.VITE_ENABLE_AGENT_PEER_CHAT, true),
} as const;

export function hasLiteLLMCredentials(): boolean {
  return !env.useMockLitellm && env.litellmApiKey.length > 0;
}
