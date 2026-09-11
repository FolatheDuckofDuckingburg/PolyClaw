export type ProviderType = 'anthropic' | 'openai' | 'deepseek' | 'gemini' | 'ollama';

export interface ProviderConfig {
  provider: ProviderType;
  modelName: string;
  apiKey?: string;
  baseUrl?: string;
  maxSteps?: number;
}

export interface PolyClawRc {
  defaultProvider?: ProviderType;
  providers?: Partial<Record<ProviderType, {
    defaultModel?: string;
    baseUrl?: string;
    apiKey?: string;
  }>>;
}
