import { openai, createOpenAI } from '@ai-sdk/openai';
import { anthropic as anthropicProvider } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { ProviderConfig } from '../types.js';
import { LanguageModel } from 'ai';

/**
 * Ollama serves an OpenAI-compatible API under /v1 (since 0.1.24) that streams
 * native tool calls. The native /api/chat streaming parser in
 * ollama-ai-provider 1.2.0 only detects tool calls embedded in the model's
 * text, so models that use Ollama's native tool API never call tools through
 * it. Both http://host:11434 and http://host:11434/api are accepted here.
 */
function ollamaOpenAIBaseUrl(baseUrl: string | undefined): string {
  const base = (baseUrl || 'http://localhost:11434').replace(/\/+$/, '');
  const withoutApi = base.endsWith('/api') ? base.slice(0, -'/api'.length) : base;
  return `${withoutApi}/v1`;
}

export function getLanguageModel(config: ProviderConfig): LanguageModel {
  switch (config.provider) {
    case 'openai':
      return openai(config.model);
    case 'anthropic':
      return anthropicProvider(config.model);
    case 'gemini':
      return google(config.model);
    case 'deepseek': {
      // ✅ Correct way to configure custom OpenAI-compatible endpoints:
      const customOpenAI = createOpenAI({
        baseURL: config.baseUrl || 'https://api.deepseek.com',
        apiKey: config.apiKey,
      });
      return customOpenAI(config.model);
    }
    case 'ollama': {
      const ollama = createOpenAI({
        baseURL: ollamaOpenAIBaseUrl(config.baseUrl),
        apiKey: config.apiKey || 'ollama',
      });
      return ollama(config.model);
    }
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}
