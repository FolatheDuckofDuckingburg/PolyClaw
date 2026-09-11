import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { ClawEngine } from '../core/ClawEngine.js';

export async function startRepl(engine: ClawEngine): Promise<void> {
  const rl = readline.createInterface({ input, output });

  console.log('\n🦀 PolyClaw');
  console.log('Type "exit" or "quit" to leave.\n');

  try {
    while (true) {
      const prompt = await rl.question('polyclaw> ');
      const trimmed = prompt.trim();

      if (!trimmed) continue;
      if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        break;
      }

      console.log();
      await engine.execute(trimmed);
      console.log();
    }
  } finally {
    rl.close();
  }
}
