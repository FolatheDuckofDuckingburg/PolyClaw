import { streamText, tool } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOllama } from 'ollama-ai-provider';
import { z } from 'zod';
import { execaCommand } from 'execa';
import fs from 'fs/promises';
import { runAgent } from '../agent.js';
import { ProviderConfig } from '../types.js';

export class ClawEngine {
  constructor(public config: ProviderConfig) {}

  async execute(prompt: string): Promise<void> {
    await executeAgent(prompt, this.config.provider, this.config.modelName);
  }
}

// 1. Dynamic Provider Resolver
export function getProviderModel(provider: string, modelName: string) {
  switch (provider) {
    case 'ollama':
      return createOllama({ baseURL: process.env.OLLAMA_HOST || 'http://localhost:11434/api' })(
        modelName || 'deepseek-r1:8b'
      );
    case 'deepseek':
      return createOpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com/v1',
      })(modelName || 'deepseek-coder');
    case 'openai':
      return createOpenAI({ apiKey: process.env.OPENAI_API_KEY })(modelName || 'gpt-4o');
    case 'gemini':
      return createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })(
        modelName || 'gemini-1.5-pro'
      );
    case 'anthropic':
    default:
      return createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })(
        modelName || 'claude-3-5-sonnet-20241022'
      );
  }
}

// 2. Multi-Step Terminal Execution Loop
export async function executeAgent(prompt: string, provider: string, modelName: string) {
  const model = getProviderModel(provider, modelName);

  const result = streamText({
    model,
    system: 'You are PolyClaw, an autonomous terminal agent. Execute tools safely to assist developers.',
    prompt,
    maxSteps: 10, // Allows tool calling back and forth until the task is complete
    tools: {
      runShell: tool({
        description: 'Execute shell commands in the current workspace',
        parameters: z.object({ command: z.string() }),
        execute: async ({ command }) => {
          try {
            const { stdout, stderr } = await execaCommand(command, { shell: true });
            return { stdout, stderr, exitCode: 0 };
          } catch (err: any) {
            return { error: err.message, exitCode: err.exitCode || 1 };
          }
        },
      }),
      writeFile: tool({
        description: 'Write content directly to a file',
        parameters: z.object({
          filePath: z.string(),
          content: z.string(),
        }),
        execute: async ({ filePath, content }) => {
          await fs.writeFile(filePath, content, 'utf-8');
          return { success: true, filePath };
        },
      }),
    },
  });

  // Stream token-by-token output straight to terminal stdout
  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }
}
