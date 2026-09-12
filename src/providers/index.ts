import { openai } from '@ai-sdk/openai';
import { anthropic as anthropicProvider } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { createOllama } from 'ollama-ai-provider';
import { ProviderConfig } from '../types.js';
import { LanguageModel } from 'ai';

export function getLanguageModel(config: ProviderConfig): LanguageModel {
  switch (config.provider) {
    case 'openai':
      return openai(config.model);
    case 'anthropic':
      return anthropicProvider(config.model);
    case 'gemini':
      return google(config.model);
    case 'deepseek':
      // DeepSeek is OpenAI-compatible; route through custom base URL if direct provider isn't loaded
      return openai(config.model, {
        baseURL: config.baseUrl || 'https://deepseek.com',
      });
    case 'ollama': {
      const ollama = createOllama({
        baseURL: config.baseUrl || 'http://localhost:11434/api',
      });
      return ollama(config.model);
    }
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}
