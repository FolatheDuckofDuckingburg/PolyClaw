import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { loadConfig } from '../dist/src/config.js';

async function withProfile(profile, run) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'polyclaw-config-'));
  const profilePath = path.join(directory, 'profile.json');
  try {
    if (profile !== undefined) {
      await fs.writeFile(profilePath, JSON.stringify(profile), 'utf8');
    }
    await run(profilePath);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}

test('defaults to local Ollama without requiring an API key', async () => {
  await withProfile(undefined, async (profilePath) => {
    const config = await loadConfig({}, { profilePath, env: {} });
    assert.equal(config.provider, 'ollama');
    assert.equal(config.model, 'deepseek-r1:8b');
    assert.equal(config.baseUrl, 'http://localhost:11434');
    assert.equal(config.apiKey, undefined);
  });
});

test('CLI provider override selects that provider profile and its own API key', async () => {
  await withProfile({
    defaultProvider: 'ollama',
    providers: {
      ollama: { defaultModel: 'deepseek-r1:8b' },
      openai: { defaultModel: 'gpt-4o-mini', apiKey: 'env:OPENAI_API_KEY' },
    },
  }, async (profilePath) => {
    const config = await loadConfig({ provider: 'openai' }, {
      profilePath,
      env: {
        OPENAI_API_KEY: 'openai-test-key',
        DEEPSEEK_API_KEY: 'must-not-be-used',
      },
    });
    assert.equal(config.provider, 'openai');
    assert.equal(config.model, 'gpt-4o-mini');
    assert.equal(config.apiKey, 'openai-test-key');
    assert.equal(config.baseUrl, undefined);
  });
});

test('CLI overrides take precedence over environment and profile values', async () => {
  await withProfile({
    defaultProvider: 'deepseek',
    providers: { deepseek: { defaultModel: 'profile-model' } },
  }, async (profilePath) => {
    const config = await loadConfig({ provider: 'openai', model: 'cli-model', maxSteps: 4 }, {
      profilePath,
      env: { PolyClaw_PROVIDER: 'deepseek', PolyClaw_MODEL: 'env-model' },
    });
    assert.equal(config.provider, 'openai');
    assert.equal(config.model, 'cli-model');
    assert.equal(config.maxSteps, 4);
  });
});

test('ignores an unsupported provider value from the environment', async () => {
  await withProfile(undefined, async (profilePath) => {
    const config = await loadConfig({}, {
      profilePath,
      env: { PolyClaw_PROVIDER: 'not-a-provider' },
    });
    assert.equal(config.provider, 'ollama');
  });
});
