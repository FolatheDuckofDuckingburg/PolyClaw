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

    const model = getLanguageModel(this.config);
    const maxSteps = this.config.maxSteps || 10;

    const result = streamText({
      model,
      system: 'You are PolyClaw, an autonomous terminal agent with access to project files, an approval-gated shell command tool, and an active project knowledge graph. Never claim a command ran unless its tool result confirms it. Explain why a command is needed before requesting approval.',
      prompt,
      maxSteps,
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
  }
}
