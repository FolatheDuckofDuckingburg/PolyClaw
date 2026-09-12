import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { ClawEngine } from '../core/ClawEngine.js';

export async function startRepl(engine: ClawEngine): Promise<void> {
  const rl = readline.createInterface({ input, output });

  console.log('\n🦀 PolyClaw');
  console.log('Type "help" or "?" for commands, "exit" or "quit" to leave.\n');

  try {
    while (true) {
      const prompt = await rl.question('polyclaw> ');
      const trimmed = prompt.trim();

      if (!trimmed) continue;

      const lower = trimmed.toLowerCase();

      if (lower === 'exit' || lower === 'quit') {
        break;
      }

      if (lower === 'clear') {
        console.clear();
        continue;
      }

      if (lower === 'help' || lower === '?') {
        console.log('\nPolyClaw REPL Commands:');
        console.log('  help, ?      Display available REPL commands');
        console.log('  clear        Clear the terminal screen');
        console.log('  exit, quit   Exit PolyClaw\n');
        console.log('Or type any prompt to execute a task with PolyClaw.\n');
        continue;
      }

      console.log();
      const outputText = await engine.execute(trimmed);
      if (outputText) {
        console.log(outputText);
      }
      console.log();
    }
  } finally {
    rl.close();
  }
}
