import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { ProviderConfig } from './types.js';

const CONFIG_FILE = path.join(os.homedir(), '.PolyClawrc.json');

export async function loadConfig(): Promise<ProviderConfig> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    return {
      provider: parsed.defaultProvider || (process.env.PolyClaw_PROVIDER as any) || 'ollama',
      model: parsed.providers?.[parsed.defaultProvider]?.defaultModel || process.env.PolyClaw_MODEL || 'deepseek-r1:8b',
      baseUrl: parsed.providers?.[parsed.defaultProvider]?.baseUrl || process.env.OLLAMA_HOST,
      apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY
    };
  } catch {
    // Graceful fallback to default environmental workspace targets if config profile does not exist
    return {
      provider: (process.env.PolyClaw_PROVIDER as any) || 'ollama',
      model: process.env.PolyClaw_MODEL || 'deepseek-r1:8b',
      baseUrl: process.env.OLLAMA_HOST || 'http://localhost:11434',
      apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY
    };
  }
}
