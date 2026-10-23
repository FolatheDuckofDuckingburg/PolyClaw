#!/usr/bin/env node

import { Command } from 'commander';
import readline from 'readline';
import { setShellApprovalHandler } from '../src/tools/shell.js';
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
      const config = await loadConfig({
        provider: options.provider as ProviderType | undefined,
        model: options.model,
        apiKey: options.apiKey,
        baseUrl: options.baseUrl,
        maxSteps: options.maxSteps,
      });

      const engine = new ClawEngine(config);
      const prompt = promptParts.join(' ').trim();

      if (prompt) {
        setShellApprovalHandler((command) => new Promise((resolve) => {
          const approval = readline.createInterface({ input: process.stdin, output: process.stdout });
          approval.question(`\nPolyClaw requests permission to run:\n${command}\nType YES to approve, anything else to deny: `, (answer) => {
            approval.close();
            resolve(answer.trim() === 'YES');
          });
        }));
        try {
          await engine.execute(prompt);
        } finally {
          setShellApprovalHandler(undefined);
        }
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
