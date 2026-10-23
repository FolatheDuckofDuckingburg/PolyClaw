import test from 'node:test';
import assert from 'node:assert/strict';
import { runShellCommand, setShellApprovalHandler } from '../dist/src/tools/shell.js';

test('blocks known dangerous executables before requesting approval', async () => {
  let asked = false;
  setShellApprovalHandler(async () => { asked = true; return true; });
  try {
    const result = await runShellCommand.execute({
      command: 'rm',
      args: ['-rf', 'important-folder'],
      reason: 'cleanup',
    });
    assert.equal(result.success, false);
    assert.equal(result.blocked, true);
    assert.equal(asked, false);
  } finally {
    setShellApprovalHandler(undefined);
  }
});

test('does not execute a command when approval is denied', async () => {
  setShellApprovalHandler(async () => false);
  try {
    const result = await runShellCommand.execute({
      command: 'node',
      args: ['--version'],
      reason: 'check Node.js version',
    });
    assert.equal(result.success, false);
    assert.equal(result.approved, false);
  } finally {
    setShellApprovalHandler(undefined);
  }
});

test('runs an approved executable without invoking a shell', async () => {
  setShellApprovalHandler(async () => true);
  try {
    const result = await runShellCommand.execute({
      command: 'node',
      args: ['--version'],
      reason: 'verify the runtime version',
    });
    assert.equal(result.success, true);
    assert.match(result.output, /^v\d+\./);
    assert.equal(result.exitCode, 0);
  } finally {
    setShellApprovalHandler(undefined);
  }
});
