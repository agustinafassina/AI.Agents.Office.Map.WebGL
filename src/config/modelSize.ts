export function estimateModelParamBillions(modelId: string): number {
  const id = modelId.toLowerCase();

  const explicit = id.match(/(\d+(?:\.\d+)?)\s*b\b/);
  if (explicit) return parseFloat(explicit[1]);

  if (id.includes('mini') || id.includes('nano') || id.includes('flash')) return 0.5;
  if (id.includes('small')) return 1;

  if (id.includes('llama3.2')) return 3;
  if (id.includes('llama3.1')) return 8;
  if (id.includes('llama3') && !id.includes('1b') && !id.includes('2b')) return 8;

  if (id.includes('gpt-4o') && !id.includes('mini')) return 20;
  if (id.includes('gpt-4')) return 20;
  if (id.includes('claude-3-5') || id.includes('claude-sonnet')) return 20;
  if (id.includes('gemini-pro') || id.includes('gemini-1.5-pro')) return 20;

  if (id.includes('70b')) return 70;
  if (id.includes('34b') || id.includes('32b')) return 34;
  if (id.includes('13b')) return 13;
  if (id.includes('8b') || id.includes('7b')) return 8;
  if (id.includes('3b')) return 3;
  if (id.includes('2b')) return 2;
  if (id.includes('1b')) return 1;

  return 4;
}

export function sortModelsBySizeDesc<T extends { id: string }>(models: T[]): T[] {
  return [...models].sort((a, b) => {
    const sizeDiff = estimateModelParamBillions(b.id) - estimateModelParamBillions(a.id);
    return sizeDiff !== 0 ? sizeDiff : a.id.localeCompare(b.id);
  });
}
