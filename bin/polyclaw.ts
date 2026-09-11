#!/usr/bin/env node

import { Command } from 'commander';
import { loadConfig } from '../src/config.js';
import { ClawEngine } from '../src/core/ClawEngine.js';
import { startRepl } from '../src/ui/repl.js';
import { ProviderType } from '../src/types.js';

const program = new Command();

program
  .name('polyclaw')
  .description('Model-agnostic autonomous CLI coding agent')
  .version('0.1.0');

program
  .argument('[prompt...]', 'Task or prompt for PolyClaw to execute')
  .option('-p, --provider <provider>', 'LLM provider (anthropic, openai, deepseek, gemini, ollama)')
  .option('-m, --model <model>', 'Model identifier')
  .option('-k, --api-key <key>', 'API key override')
  .option('-u, --base-url <url>', 'Endpoint base URL override')
  .option('-s, --max-steps <number>', 'Maximum execution loop steps', parseInt)
  .action(async (promptParts: string[], options) => {
    const config = loadConfig({
      provider: options.provider as ProviderType,
      modelName: options.model,
      apiKey: options.apiKey,
      baseUrl: options.baseUrl,
      maxSteps: options.maxSteps,
    });

    const engine = new ClawEngine(config);
    const prompt = promptParts.join(' ').trim();

    try {
      if (prompt) {
        await engine.execute(prompt);
      } else {
        await startRepl(engine);
      }
    } catch (err: any) {
      console.error(`\nPolyClaw Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
