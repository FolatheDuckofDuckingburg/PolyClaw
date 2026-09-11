import fs from 'fs';
import path from 'path';
import os from 'os';
import { ProviderConfig, ProviderType } from './providers';

const CONFIG_PATH = path.join(os.homedir(), '.polyclawrc.json');

export function loadConfig(cliOptions: Partial<ProviderConfig> = {}): ProviderConfig {
  let fileConfig: any = {};

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    } catch (e) {
      console.warn('Failed to parse ~/.polyclawrc.json, falling back to env/defaults');
    }
  }

  const provider = (
    cliOptions.provider ||
    process.env.POLYCLAW_PROVIDER ||
    fileConfig.defaultProvider ||
    'ollama'
  ) as ProviderType;

  const modelName = (
    cliOptions.modelName ||
    process.env.POLYCLAW_MODEL ||
    fileConfig.providers?.[provider]?.defaultModel ||
    ''
  );

  return {
    provider,
    modelName,
    baseUrl: cliOptions.baseUrl || fileConfig.providers?.[provider]?.baseUrl,
    apiKey: cliOptions.apiKey,
  };
}
