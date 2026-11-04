import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cliPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'bin', 'polyclaw.js');

// A minimal OpenAI-compatible endpoint that asks for one file write, then answers.
function startStub() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        let payload = {};
        try {
          payload = JSON.parse(body || '{}');
        } catch {
          payload = {};
        }
        const toolResults = (payload.messages || []).filter((message) => message.role === 'tool').length;
        const chunk = (delta, finishReason = null) =>
          `data: ${JSON.stringify({
            id: 'chunk',
            object: 'chat.completion.chunk',
            created: 1,
            model: 'stub-model',
            choices: [{ index: 0, delta, finish_reason: finishReason }],
          })}\n\n`;

        res.writeHead(200, { 'content-type': 'text/event-stream' });
        res.write(chunk({ role: 'assistant' }));
        if (toolResults === 0) {
          res.write(chunk({
            tool_calls: [{
              index: 0,
              id: 'call_0',
              type: 'function',
              function: {
                name: 'writeFile',
                arguments: JSON.stringify({ filePath: 'created.txt', content: 'approval works\n' }),
              },
            }],
          }));
          res.write(chunk({}, 'tool_calls'));
        } else {
          res.write(chunk({ content: 'done' }));
          res.write(chunk({}, 'stop'));
        }
        res.write('data: [DONE]\n\n');
        res.end();
      });
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

test('one-shot mode writes a file after the user approves the diff', async () => {
  const { server, port } = await startStub();
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'polyclaw-oneshot-'));
  const child = spawn(
    process.execPath,
    [cliPath, '-p', 'deepseek', '-u', `http://127.0.0.1:${port}/v1`, '-k', 'test-key', '-m', 'stub-model', 'create a file'],
    { cwd: workspace, stdio: ['pipe', 'pipe', 'pipe'] },
  );

  let output = '';
  let answered = false;
  const collect = (data) => {
    output += data;
    if (!answered && output.includes('Type YES to approve')) {
      answered = true;
      child.stdin.write('YES\n');
    }
  };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);

  try {
    const code = await new Promise((resolve) => {
      const timer = setTimeout(() => {
        child.kill('SIGKILL');
        resolve('timeout');
      }, 20_000);
      child.on('exit', (exitCode) => {
        clearTimeout(timer);
        resolve(exitCode);
      });
    });

    assert.equal(code, 0, `CLI exited with ${code}\n${output}`);
    assert.match(output, /Proposed file change: created\.txt/);
    assert.equal(await fs.readFile(path.join(workspace, 'created.txt'), 'utf8'), 'approval works\n');
  } finally {
    server.close();
    await fs.rm(workspace, { recursive: true, force: true });
  }
});
