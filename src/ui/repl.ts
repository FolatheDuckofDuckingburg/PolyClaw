import readline from 'readline';
import { ClawEngine } from '../core/ClawEngine.js';
import { ProviderConfig } from '../types.js';

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
  
  header: (config: ProviderConfig) => {
    console.clear();
    // Poly's ASCII Art boot splash
    console.log(`${COLORS.boldRed}`);
    console.log(`    🦀   (🦀)     `);
    console.log(`     \\  /       `);
    console.log(`    (oooo)  PolyClaw v0.1.0`);
    console.log(`   / |||| \\ `);
    console.log(`  ✂  ~~~~  ✂`);
    console.log(`${COLORS.reset}`);
    
    console.log(`${COLORS.boldRed}🦀 PolyClaw — Meet Poly, your red crab dev copilot!${COLORS.reset}`);
    console.log(`${COLORS.dim}Engine: ${config.provider} | Model: ${config.model}${COLORS.reset}`);
    console.log(`${COLORS.dim}Type 'exit' to let Poly rest.${COLORS.reset}`);
    UI.divider();
  },

  logAction: (message: string) => {
    console.log(`${COLORS.dim}🦀 Poly is ${message}...${COLORS.reset}`);
  },

  logTool: (name: string, params: object) => {
    console.log(`\n${COLORS.brightRed}✂️  [Poly Snip] Executing: ${COLORS.bold}${name}${COLORS.reset}`);
    console.log(`${COLORS.dim}Arguments: ${JSON.stringify(params)}${COLORS.reset}`);
  }
};

export function startRepl(config: ProviderConfig) {
  const engine = new ClawEngine(config);
  
  UI.header(config);
  
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
        
        console.log(); // Final pad line completion
        UI.divider();
      } catch (err: any) {
        console.error(`\n${COLORS.boldRed}⚠️ Poly snapped a claw! Error: ${err.message}${COLORS.reset}`);
        UI.divider();
      }
    }

    rl.prompt();
  }).on('close', () => {
    console.log(`\n${COLORS.red}Poly scuttled away into the sand. Configuration saved.${COLORS.reset}\n`);
    process.exit(0);
  });
}
