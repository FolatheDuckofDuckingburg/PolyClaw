import { streamText } from 'ai';
import { getLanguageModel } from './providers/index.js';
import { runShellCommand } from './tools/shell.js';
import { ProviderConfig } from './types.js';

/**
 * Legacy agent entry point. Shell requests intentionally fail closed unless
 * the interactive approval handler has been configured by the REPL.
 */
export async function runAgent(prompt: string, config: ProviderConfig): Promise<void> {
  let model;
  try {
    model = getLanguageModel(config);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not initialize the ${config.provider} provider for model "${config.model}": ${message}`);
  }

  try {
    const result = streamText({
      model,
      system: 'You are PolyClaw, a model-agnostic CLI coding agent. Execute tools responsibly. Shell commands require explicit interactive approval.',
      prompt,
      maxSteps: config.maxSteps || 10,
      tools: { runShellCommand },
    });

    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`The ${config.provider} provider failed while generating a response. Check your API key, model name, network connection, and provider status. Details: ${message}`);
  }
}
