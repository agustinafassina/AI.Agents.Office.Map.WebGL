function readBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

export const env = {
  litellmBaseUrl:
    import.meta.env.VITE_LITELLM_BASE_URL?.trim() || '/api/litellm',
  litellmApiKey: import.meta.env.VITE_LITELLM_API_KEY?.trim() || '',
  useMockLitellm: readBool(import.meta.env.VITE_USE_MOCK_LITELLM, true),
} as const;

export function hasLiteLLMCredentials(): boolean {
  return !env.useMockLitellm && env.litellmApiKey.length > 0;
}
