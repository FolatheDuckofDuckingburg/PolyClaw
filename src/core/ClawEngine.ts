import { streamText, tool } from 'ai';
import { z } from 'zod';
import { execa } from 'execa';
import fs from 'fs/promises';
import { getLanguageModel, ProviderConfig } from '../providers/index.js';
import { readFile, writeFile } from '../tools/fileOps.js';
import { execaCommand } from 'execa';
import fs from 'fs/promises';
import { runAgent } from '../agent.js';
import { ProviderConfig } from '../types.js';

export class ClawEngine {
  constructor(public config: ProviderConfig) {}

  async execute(prompt: string): Promise<string> {
    return runAgent(prompt, this.config);
  }
}

export class ClawEngine {
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async execute(prompt: string): Promise<void> {
    const model = getLanguageModel(this.config);
    const maxSteps = this.config.maxSteps || 10;

    const result = streamText({
      model,
      system: 'You are PolyClaw, an autonomous terminal agent. Execute tools safely to assist developers.',
      prompt,
      maxSteps,
      tools: {
        runShell: tool({
          description: 'Execute shell commands in the current workspace',
          parameters: z.object({ command: z.string() }),
          execute: async ({ command }) => {
            try {
              const { stdout, stderr } = await execa(command, { shell: true });
              return { stdout, stderr, exitCode: 0 };
            } catch (err: any) {
              return { error: err.message, exitCode: err.exitCode || 1 };
            }
          },
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
        readFile,
        writeFile,
      },
    });

    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }
  }
}
