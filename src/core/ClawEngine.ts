import { streamText } from 'ai';
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
        readFile,
        writeFile,
      },
    });

    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }
  }
}
