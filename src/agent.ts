import { streamText, tool } from 'ai';
import { z } from 'zod';
import { execaCommand } from 'execa';
import { getLanguageModel } from './providers/index.js';
import { ProviderConfig } from './types.js';

export async function runAgent(prompt: string, config: ProviderConfig): Promise<void> {
  const model = getLanguageModel(config);

  const result = streamText({
    model,
    system: 'You are PolyClaw, a model-agnostic CLI coding agent. Execute tools responsibly.',
    prompt,
    maxSteps: config.maxSteps || 10,
    tools: {
      runShell: tool({
        description: 'Execute terminal shell commands securely in the user workspace',
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
    },
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }
}
