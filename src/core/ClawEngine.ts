import { streamText } from 'ai';
import { getLanguageModel } from '../providers/index.js';
import { readFile, writeFile } from '../tools/fileOps.js';
import { runShellCommand } from '../tools/shell.js';
import { updateKnowledgeGraph, queryKnowledgeGraph, initializeGraph } from '../tools/graphOps.js';
import { ProviderConfig } from '../types.js';

export class ClawEngine {
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  get provider(): string {
    return this.config.provider;
  }

  get model(): string {
    return this.config.model;
  }

  async execute(prompt: string): Promise<void> {
    await initializeGraph();

    let model;
    try {
      model = getLanguageModel(this.config);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Could not initialize the ${this.config.provider} provider for model "${this.config.model}": ${message}`);
    }

    try {
      const result = streamText({
        model,
        system: 'You are PolyClaw, an autonomous terminal agent with access to project files, an approval-gated shell command tool, and an active project knowledge graph. Never claim a command ran unless its tool result confirms it. Explain why a command is needed before requesting approval. File changes must be previewed and explicitly approved.',
        prompt,
        maxSteps: this.config.maxSteps || 10,
        tools: {
          readFile,
          writeFile,
          runShellCommand,
          updateKnowledgeGraph,
          queryKnowledgeGraph
        },
      });

      for await (const textPart of result.textStream) {
        process.stdout.write(textPart);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`The ${this.config.provider} provider failed while generating a response. Check your API key, model name, network connection, and provider status. Details: ${message}`);
    }
  }
}
