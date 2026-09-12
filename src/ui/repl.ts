import readline from 'readline';
import { ClawEngine } from '../core/ClawEngine.js';
import { ProviderConfig } from '../types.js';

export function startRepl(config: ProviderConfig) {
  const engine = new ClawEngine(config);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'PolyClaw 🦀 > ',
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
        // execute returns void and outputs streaming text directly to stdout
        await engine.execute(input);
        console.log(); // Appends a newline buffer after string chunk stream completes
      } catch (err: any) {
        console.error(`\nExecution Error: ${err.message}`);
      }
    }

    rl.prompt();
  }).on('close', () => {
    console.log('\nExiting PolyClaw session. Happy coding!');
    process.exit(0);
  });
}
