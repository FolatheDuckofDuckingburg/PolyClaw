import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { writeFile, setFileApprovalHandler } from '../dist/src/tools/fileOps.js';

const testPath = `.polyclaw-file-approval-test-${process.pid}.txt`;

test('previews a file change and does not write when approval is denied', async () => {
  const original = 'before\n';
  await fs.writeFile(testPath, original, 'utf8');
  let seenPreview = '';
  setFileApprovalHandler(async (preview) => {
    seenPreview = preview;
    return false;
  });
  try {
    const result = await writeFile.execute({
      filePath: testPath,
      content: 'after\n',
    });
    assert.equal(result.success, false);
    assert.equal(result.approved, false);
    assert.match(seenPreview, /before/);
    assert.match(seenPreview, /after/);
    assert.equal(await fs.readFile(testPath, 'utf8'), original);
  } finally {
    setFileApprovalHandler(undefined);
    await fs.rm(testPath, { force: true });
  }
});

test('fails closed when file-change approval is unavailable', async () => {
  setFileApprovalHandler(undefined);
  try {
    const result = await writeFile.execute({
      filePath: testPath,
      content: 'must not be written\n',
    });
    assert.equal(result.success, false);
    assert.equal(result.blocked, true);
    await assert.rejects(fs.access(testPath));
  } finally {
    await fs.rm(testPath, { force: true });
  }
});

test('writes proposed content only after explicit approval', async () => {
  setFileApprovalHandler(async (preview) => preview.includes('approved content'));
  try {
    const result = await writeFile.execute({
      filePath: testPath,
      content: 'approved content\n',
    });
    assert.equal(result.success, true);
    assert.equal(result.changed, true);
    assert.equal(await fs.readFile(testPath, 'utf8'), 'approved content\n');
  } finally {
    setFileApprovalHandler(undefined);
    await fs.rm(testPath, { force: true });
  }
});
