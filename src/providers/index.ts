import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOllama } from 'ollama-ai-provider';
import { LanguageModel } from 'ai';
import { ProviderConfig, ProviderType } from '../types.js';

export { ProviderConfig, ProviderType };

export function getLanguageModel(config: ProviderConfig): LanguageModel {
  const { provider, modelName, apiKey, baseUrl } = config;

  switch (provider) {
    case 'anthropic': {
      const anthropic = createAnthropic({
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      });
      return anthropic(modelName || 'claude-3-5-sonnet-20241022');
    }

    case 'openai': {
      const openai = createOpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY,
      });
      return openai(modelName || 'gpt-4o');
    }

    case 'deepseek': {
      const deepseek = createOpenAI({
        apiKey: apiKey || process.env.DEEPSEEK_API_KEY,
        baseURL: baseUrl || 'https://api.deepseek.com/v1',
      });
      return deepseek(modelName || 'deepseek-coder');
    }

    case 'gemini': {
      const google = createGoogleGenerativeAI({
        apiKey: apiKey || process.env.GEMINI_API_KEY,
      });
      return google(modelName || 'gemini-1.5-pro');
    }

    case 'ollama': {
      const ollama = createOllama({
        baseURL: baseUrl || process.env.OLLAMA_HOST || 'http://localhost:11434/api',
      });
      return ollama(modelName || 'deepseek-r1:8b');
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
