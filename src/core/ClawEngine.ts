import { streamText } from 'ai';
import { getLanguageModel } from '../providers/index.js';
import { readFile, writeFile } from '../tools/fileOps.js';
import { updateKnowledgeGraph, queryKnowledgeGraph, initializeGraph } from '../tools/graphOps.js';
import { ProviderConfig } from '../types.js';

export class ClawEngine {
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async execute(prompt: string): Promise<void> {
    // Synchronize current saved knowledge maps onto disk
    await initializeGraph();

    const model = getLanguageModel(this.config);
    const maxSteps = this.config.maxSteps || 10;

    const result = streamText({
      model,
      system: 'You are PolyClaw, an autonomous terminal agent using an active project knowledge graph. Write and query nodes to trace context pathways across codebase files.',
      prompt,
      maxSteps,
      tools: {
        readFile,
        writeFile,
        updateKnowledgeGraph,
        queryKnowledgeGraph
      },
    });

    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }
  }
}
