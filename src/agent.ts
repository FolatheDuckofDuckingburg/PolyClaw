import { generateText, tool } from 'ai';
import { z } from 'zod';
import { execa } from 'execa';
import fs from 'fs/promises';
import { getLanguageModel, ProviderConfig } from './providers/index.js';

export async function runAgent(prompt: string, config: ProviderConfig) {
  const model = getLanguageModel(config);

  const result = await generateText({
    model,
    system: `You are PolyClaw, an autonomous CLI agent. You assist developers with file operations and shell tasks safely.`,
    prompt,
    maxSteps: config.maxSteps || 5,
    tools: {
      executeShellCommand: tool({
        description: 'Run a shell command on the host machine.',
        parameters: z.object({
          command: z.string().describe('The bash/zsh command to run'),
        }),
        execute: async ({ command }) => {
          try {
            const { stdout, stderr } = await execa(command, { shell: true });
            return { stdout, stderr, exitCode: 0 };
          } catch (error: any) {
            return { error: error.message, exitCode: error.exitCode || 1 };
          }
        },
      }),

      readFile: tool({
        description: 'Read contents of a file from the local workspace.',
        parameters: z.object({
          filePath: z.string().describe('Relative or absolute file path'),
        }),
        execute: async ({ filePath }) => {
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            return { content };
          } catch (err: any) {
            return { error: `Failed to read file: ${err.message}` };
          }
        },
      }),
    },
  });

  return result.text;
}
