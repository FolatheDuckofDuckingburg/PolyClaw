import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { ProviderConfig, ProviderType } from './types.js';

const CONFIG_FILE = path.join(os.homedir(), '.PolyClawrc.json');

type ConfigOverrides = Partial<Pick<ProviderConfig, 'provider' | 'model' | 'apiKey' | 'baseUrl' | 'maxSteps'>>;

const API_KEY_ENV: Partial<Record<ProviderType, string>> = {
  deepseek: 'DEEPSEEK_API_KEY',
  openai: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
};

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

  const provider = overrides.provider
    ?? (process.env.PolyClaw_PROVIDER as ProviderType | undefined)
    ?? parsed.defaultProvider
    ?? 'ollama';
  const providerProfile = parsed.providers?.[provider] ?? {};
  const model = overrides.model
    ?? process.env.PolyClaw_MODEL
    ?? providerProfile.defaultModel
    ?? (provider === 'ollama' ? 'deepseek-r1:8b' : '');

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
