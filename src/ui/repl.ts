import readline from 'readline';
import { ClawEngine } from '../core/ClawEngine.js';

const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[90m',
  red: '\x1b[31m',
  brightRed: '\x1b[91m',
  boldRed: '\x1b[1;31m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

const UI = {
  divider: () => console.log(`${COLORS.red}${'-'.repeat(process.stdout.columns || 60)}${COLORS.reset}`),

  header: (provider: string, model: string) => {
    console.clear();
    console.log(`${COLORS.boldRed}`);
    console.log(`    🦀   (🦀)     `);
    console.log(`     \\\\  /       `);
    console.log(`    (oooo)  PolyClaw v0.1.0`);
    console.log(`   / |||| \\\\ `);
    console.log(`  ✂  ~~~~  ✂`);
    console.log(`${COLORS.reset}`);

    console.log(`${COLORS.boldRed}🦀 PolyClaw — Meet Poly, your red crab dev copilot!${COLORS.reset}`);
    console.log(`${COLORS.dim}Engine: ${provider} | Model: ${model}${COLORS.reset}`);
    console.log(`${COLORS.dim}Type 'exit' to let Poly rest.${COLORS.reset}`);
    UI.divider();
  },

  logAction: (message: string) => {
    console.log(`${COLORS.dim}🦀 Poly is ${message}...${COLORS.reset}`);
  },
};

export function startRepl(engine: ClawEngine): void {
  UI.header(engine.provider, engine.model);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${COLORS.boldRed}Poly 🦀 > ${COLORS.reset}`,
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      rl.close();
      return;
    }

    if (input) {
      try {
        UI.divider();
        UI.logAction('scuttling through your codebase');
        await engine.execute(input);
        console.log();
        UI.divider();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`\\n${COLORS.boldRed}⚠️ Poly snapped a claw! Error: ${message}${COLORS.reset}`);
        UI.divider();
      }
    }

    rl.prompt();
  }).on('close', () => {
    console.log(`\\n${COLORS.red}Poly scuttled away into the sand.${COLORS.reset}\\n`);
    process.exit(0);
  });
}
