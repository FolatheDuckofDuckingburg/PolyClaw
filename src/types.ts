import { LanguageModel } from 'ai';

export type ProviderType = 'ollama' | 'deepseek' | 'openai' | 'gemini' | 'anthropic';

export interface ProviderConfig {
  provider: ProviderType;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  maxSteps?: number;
}
