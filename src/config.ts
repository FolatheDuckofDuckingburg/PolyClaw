import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { ProviderConfig, ProviderType } from './types.js';

const CONFIG_FILE = path.join(os.homedir(), '.PolyClawrc.json');

type ConfigOverrides = Partial<Pick<ProviderConfig, 'provider' | 'model' | 'apiKey' | 'baseUrl' | 'maxSteps'>>;

const DEFAULT_MODELS: Record<ProviderType, string> = {
  ollama: 'deepseek-r1:8b',
  deepseek: 'deepseek-coder',
  openai: 'gpt-4o',
  gemini: 'gemini-1.5-pro',
  anthropic: 'claude-3-5-sonnet-20241022',
};

const API_KEY_ENV: Partial<Record<ProviderType, string>> = {
  deepseek: 'DEEPSEEK_API_KEY',
  openai: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
};

const PROVIDERS: readonly ProviderType[] = ['ollama', 'deepseek', 'openai', 'gemini', 'anthropic'];

function isProviderType(value: unknown): value is ProviderType {
  return typeof value === 'string' && PROVIDERS.includes(value as ProviderType);
}

function readProfileApiKey(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  if (value.startsWith('env:')) return process.env[value.slice(4)] || undefined;
  return value;
}

export async function loadConfig(overrides: ConfigOverrides = {}): Promise<ProviderConfig> {
  let parsed: any = {};
  try {
    parsed = JSON.parse(await fs.readFile(CONFIG_FILE, 'utf-8'));
  } catch {
    // A missing or invalid profile falls back to environment variables and defaults.
  }

  const envProvider = process.env.PolyClaw_PROVIDER;
  const profileProvider = parsed.defaultProvider;
  const provider: ProviderType = overrides.provider
    ?? (isProviderType(envProvider) ? envProvider : undefined)
    ?? (isProviderType(profileProvider) ? profileProvider : undefined)
    ?? 'ollama';

  const providerProfile = parsed.providers?.[provider] ?? {};
  const model = overrides.model
    ?? process.env.PolyClaw_MODEL
    ?? providerProfile.defaultModel
    ?? DEFAULT_MODELS[provider];

  const apiKeyEnv = API_KEY_ENV[provider];
  const apiKey = overrides.apiKey
    ?? readProfileApiKey(providerProfile.apiKey)
    ?? (apiKeyEnv ? process.env[apiKeyEnv] : undefined);

  const baseUrl = overrides.baseUrl
    ?? providerProfile.baseUrl
    ?? (provider === 'ollama' ? process.env.OLLAMA_HOST || 'http://localhost:11434' : undefined);

  return {
    provider,
    model,
    apiKey,
    baseUrl,
    maxSteps: overrides.maxSteps,
  };
}
