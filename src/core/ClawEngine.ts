import { streamText, tool } from 'ai';
import { z } from 'zod';
import { execaCommand } from 'execa';
import { getLanguageModel } from '../providers/index.js';
import { readFile, writeFile } from '../tools/fileOps.js';
import { ProviderConfig } from '../types.js';

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
              const { stdout, stderr } = await execaCommand(command, { shell: true });
              return { stdout, stderr, exitCode: 0 };
            } catch (err: any) {
              return { error: err.message, exitCode: err.exitCode || 1 };
            }
          },
        }),
        readFile: tool({
          description: 'Read the contents of a file',
          parameters: z.object({ filePath: z.string() }),
          execute: async ({ filePath }) => {
            return await readFile(filePath);
          },
        }),
        writeFile: tool({
          description: 'Write content directly to a file',
          parameters: z.object({
            filePath: z.string(),
            content: z.string(),
          }),
          execute: async ({ filePath, content }) => {
            return await writeFile(filePath, content);
          },
        }),
      },
    });

    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }
  }
}
