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

test('blocks risky Git and npm operations before requesting approval', async (t) => {
  const cases = [
    { command: 'git', args: ['push', 'origin', 'main'] },
    { command: 'git', args: ['clean', '-fd'] },
    { command: 'npm', args: ['publish'] },
    { command: 'npm', args: ['unpublish', 'some-package'] },
  ];
  for (const item of cases) {
    await t.test(`${item.command} ${item.args.join(' ')}`, async () => {
      let asked = false;
      setShellApprovalHandler(async () => { asked = true; return true; });
      try {
        const result = await runShellCommand.execute({
          ...item,
          reason: 'test safety policy',
        });
        assert.equal(result.success, false);
        assert.equal(result.blocked, true);
        assert.equal(asked, false);
      } finally {
        setShellApprovalHandler(undefined);
      }
    });
  }
});

test('fails closed when no interactive approval handler is configured', async () => {
  setShellApprovalHandler(undefined);
  const result = await runShellCommand.execute({
    command: 'node',
    args: ['--version'],
    reason: 'check Node.js version',
  });
  assert.equal(result.success, false);
  assert.equal(result.blocked, true);
  assert.match(result.error, /approval is unavailable/i);
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
    assert.match(result.output, /^v\\d+\\./);
    assert.equal(result.exitCode, 0);
  } finally {
    setShellApprovalHandler(undefined);
  }
});
