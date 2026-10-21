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
  .argument('[prompt...]', 'Task or prompt for Poly to execute')
  .option('-p, --provider <provider>', 'LLM provider (anthropic, openai, deepseek, gemini, ollama)')
  .option('-m, --model <model>', 'Model identifier')
  .option('-k, --api-key <key>', 'API key override')
  .option('-u, --base-url <url>', 'Endpoint base URL override')
  .option('-s, --max-steps <number>', 'Maximum execution loop steps', parseInt)
  .action(async (promptParts: string[], options) => {
    try {
      const savedConfig = await loadConfig();
      const config = {
        ...savedConfig,
        provider: (options.provider ?? savedConfig.provider) as ProviderType,
        model: options.model ?? savedConfig.model,
        apiKey: options.apiKey ?? savedConfig.apiKey,
        baseUrl: options.baseUrl ?? savedConfig.baseUrl,
        maxSteps: options.maxSteps ?? savedConfig.maxSteps,
      };

      const engine = new ClawEngine(config);
      const prompt = promptParts.join(' ').trim();

      if (prompt) {
        await engine.execute(prompt);
      } else {
        startRepl(engine);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`\nPolyClaw Error: ${message}`);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);
