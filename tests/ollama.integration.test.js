import test from 'node:test';
import assert from 'node:assert/strict';
import { generateText } from 'ai';
import { getLanguageModel } from '../dist/src/providers/index.js';

const enabled = process.env.POLYCLAW_OLLAMA_TEST === '1';
const baseUrl = process.env.OLLAMA_HOST || 'http://localhost:11434';
const modelName = process.env.POLYCLAW_OLLAMA_MODEL || 'deepseek-r1:8b';

test('optional live Ollama generation smoke test', { skip: !enabled && 'Set POLYCLAW_OLLAMA_TEST=1 to run against a live Ollama server' }, async () => {
  let response;
  try {
    response = await fetch(new URL('/api/tags', baseUrl), { signal: AbortSignal.timeout(3000) });
  } catch {
    assert.fail(`Ollama is not reachable at ${baseUrl}. Start Ollama before enabling this test.`);
  }
  assert.ok(response.ok, `Ollama tags endpoint returned HTTP ${response.status}`);
  const payload = await response.json();
  const models = Array.isArray(payload.models) ? payload.models : [];
  assert.ok(
    models.some((item) => item.name === modelName || item.name?.startsWith(`${modelName}:`)),
    `Model "${modelName}" is not installed. Run: ollama pull ${modelName}`,
  );

  const result = await generateText({
    model: getLanguageModel({
      provider: 'ollama',
      model: modelName,
      baseUrl: `${baseUrl.replace(/\/$/, '')}/api`,
    }),
    prompt: 'Reply with the single word OK.',
    maxTokens: 12,
    abortSignal: AbortSignal.timeout(90_000),
  });
  assert.ok(result.text.trim().length > 0, 'Ollama returned an empty response');
});
