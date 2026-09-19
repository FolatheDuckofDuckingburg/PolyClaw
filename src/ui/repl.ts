import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { ClawEngine } from '../core/ClawEngine.js';

export async function startRepl(engine: ClawEngine): Promise<void> {
  const rl = readline.createInterface({ input, output });

  console.log('\n┌──────────────────────────────────────────┐');
  console.log('│ 🦀  PolyClaw - AI Terminal Coding Agent  │');
  console.log('└──────────────────────────────────────────┘');
  console.log('Type "help" or "?" for commands, "exit" or "quit" to leave.\n');

  try {
    while (true) {
      const prompt = await rl.question('polyclaw ❯ ');
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
        console.log('\n┌────────────────────────────────────────────────┐');
        console.log('│ PolyClaw REPL Commands                         │');
        console.log('├──────────────┬─────────────────────────────────┤');
        console.log('│ help, ?      │ Display available REPL commands │');
        console.log('│ clear        │ Clear the terminal screen       │');
        console.log('│ exit, quit   │ Exit PolyClaw interactive REPL │');
        console.log('└──────────────┴─────────────────────────────────┘');
        console.log('Or type any prompt to execute a task with PolyClaw.\n');
        continue;
      }

      console.log();
      await engine.execute(trimmed);
      console.log();
    }
  } finally {
    rl.close();
  }
}
