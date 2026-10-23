import { tool } from 'ai';
import { execa } from 'execa';
import { z } from 'zod';
import path from 'path';

const WORKSPACE_ROOT = path.resolve(process.cwd());
type ApprovalHandler = (command: string) => Promise<boolean>;
let approvalHandler: ApprovalHandler | undefined;

const BLOCKED_EXECUTABLES = new Set([
  'bash', 'sh', 'zsh', 'fish', 'cmd', 'cmd.exe', 'powershell', 'pwsh',
  'sudo', 'su', 'rm', 'rmdir', 'del', 'format', 'diskpart', 'shutdown',
  'reboot', 'reg', 'reg.exe', 'curl', 'wget', 'chmod', 'chown',
]);

export function setShellApprovalHandler(handler: ApprovalHandler | undefined): void {
  approvalHandler = handler;
}

function isBlocked(command: string, args: string[]): string | undefined {
  const executable = path.basename(command).toLowerCase();
  if (BLOCKED_EXECUTABLES.has(executable)) {
    return `The executable "${executable}" is blocked by PolyClaw's initial shell safety policy.`;
  }

  // Inspect every argument rather than assuming the subcommand is args[0].
  // Git and npm accept global options before subcommands (for example, git -C . push).
  const normalized = args.map((arg) => arg.toLowerCase());
  if (executable === 'git' && normalized.includes('push')) {
    return 'git push is blocked to prevent accidental remote changes.';
  }

  if (executable === 'npm') {
    const riskyNpmCommand = normalized.find((arg) =>
      ['publish', 'login', 'logout', 'unpublish'].includes(arg),
    );
    if (riskyNpmCommand) {
      return `npm ${riskyNpmCommand} is blocked by the initial shell safety policy.`;
    }
  }

  // Git accepts combined short flags (for example, -fd) as well as --force.
  if (
    executable === 'git'
    && normalized.includes('clean')
    && normalized.some((arg) => arg === '--force' || /^-[^-]*f/.test(arg))
  ) {
    return 'Destructive git clean commands are blocked.';
  }
  return undefined;
}

export const runShellCommand = tool({
  description: 'Request permission to run one executable with explicit arguments in the current project workspace. Each command requires the user to type YES. Shell operators, pipelines, and compound commands are not supported; request separate commands instead.',
  parameters: z.object({
    command: z.string().min(1).describe('Executable name, for example npm or git'),
    args: z.array(z.string()).default([]).describe('Arguments passed directly to the executable; do not include shell syntax'),
    reason: z.string().min(1).max(300).describe('Brief explanation of why this command is needed'),
  }),
  execute: async ({ command, args, reason }) => {
    const blockedReason = isBlocked(command, args);
    if (blockedReason) return { success: false, blocked: true, error: blockedReason };

    if (!approvalHandler) {
      return {
        success: false,
        blocked: true,
        error: 'Interactive command approval is unavailable in this mode. Run PolyClaw in its interactive REPL to approve shell commands.',
      };
    }

    const display = [command, ...args].map((part) => JSON.stringify(part)).join(' ');
    const approved = await approvalHandler(`${display}\nReason: ${reason}`);
    if (!approved) return { success: false, approved: false, error: 'User denied this command.' };

    try {
      const result = await execa(command, args, {
        cwd: WORKSPACE_ROOT,
        timeout: 120_000,
        reject: false,
        shell: false,
        windowsHide: true,
        maxBuffer: 2 * 1024 * 1024,
      });
      const output = [result.stdout, result.stderr ? `STDERR:\n${result.stderr}` : '']
        .filter(Boolean)
        .join('\n');
      return {
        success: result.exitCode === 0,
        exitCode: result.exitCode,
        timedOut: result.timedOut,
        output: output.slice(0, 20_000),
        ...(output.length > 20_000 ? { truncated: true } : {}),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Could not run command: ${message}` };
    }
  },
});
