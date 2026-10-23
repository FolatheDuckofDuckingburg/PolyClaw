# 🦀 PolyClaw

**An open-source, model-flexible terminal coding assistant.** Run local models through Ollama or connect a supported hosted provider.

PolyClaw's CLI is free and MIT-licensed. Local inference can avoid per-request hosted API charges, but requires compatible hardware, electricity, and a local model download. Hosted model providers may charge separately.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> PolyClaw is an independent project and is not affiliated with or endorsed by Anthropic or any other model provider.

## Why PolyClaw?

- **Local-first option:** run a model on your own computer with Ollama.
- **Provider choice:** Ollama, DeepSeek, OpenAI, Gemini, and Anthropic are supported by the current provider adapter.
- **Terminal workflow:** give Poly a coding task in one command or use the interactive REPL.
- **Workspace tools:** read files and review a proposed diff before approving writes.
- **Approval-gated shell tool:** request permission to run individual executable commands.
- **Open source:** inspect and modify the project under the MIT License.

## What it can do today

PolyClaw can interact with a configured model, read text files within its working project workspace, preview proposed file changes, request explicit approval before applying them, use a lightweight knowledge graph for codebase context, and request approval before running a supported shell command.

### File-edit approval

Before writing, PolyClaw displays a unified diff and asks for explicit approval. Type `YES` to apply it; any other response denies it. In non-interactive modes without a configured approval handler, file writes fail closed. The preview is truncated for very large changes, so review the target path and proposed content carefully.

### Shell-command safety: important limitations

- Each command request requires explicit approval. In the interactive REPL, type `YES` to approve; any other response denies it.
- Commands are invoked directly without a shell. Shell operators, pipelines, and compound commands are not supported; ask for separate commands.
- Some executables and operations are blocked by an initial denylist, including common destructive commands, `git push`, and `npm publish`.
- **This is not a security sandbox.** The denylist is not exhaustive, and an approved executable may still change or delete files, access networks, or perform other consequential actions. Review the exact command and its arguments before approving it. Use PolyClaw only in a workspace where you can tolerate the effects of commands you approve.
- Shell execution is available only when an interactive approval handler is configured; non-interactive modes without one fail closed.

## Quick start: local model, no hosted API key

### 1. Install the prerequisites

- [Node.js](https://nodejs.org/) (Node 22 recommended)
- [Ollama](https://ollama.com/download)

Install and start Ollama, then download a model. The default model is `deepseek-r1:8b`; it may require substantial RAM. Choose a smaller model if your computer cannot run it comfortably.

```sh
ollama pull deepseek-r1:8b
```

The initial model download requires an internet connection. Once downloaded, inference runs locally; this setup does not require a hosted model API key.

### 2. Install and build PolyClaw

```sh
git clone https://github.com/FolatheDuckofDuckingburg/PolyClaw.git
cd PolyClaw
npm install
npm test
```

`npm test` builds the TypeScript project and runs the automated Node.js test suite.

### 3. Ask Poly a coding question

```sh
node dist/bin/polyclaw.js --provider ollama --model deepseek-r1:8b "Explain the structure of this project"
```

Or start the interactive terminal, where shell and file-change requests can be reviewed:

```sh
node dist/bin/polyclaw.js --provider ollama --model deepseek-r1:8b
```

Type `exit` or `quit` to leave the REPL.

### Windows PowerShell

The commands above work in PowerShell too. If Ollama is installed and running locally, no API-key environment variable is needed for this setup. If PowerShell blocks `npm.ps1` due to execution policy, use `npm.cmd install` rather than changing the system-wide execution policy.

## Hosted providers

Hosted providers may charge for usage and require their own API keys. Set the provider and model using CLI flags, or configure environment variables:

| Provider | Provider name | API key environment variable |
| --- | --- | --- |
| Ollama | `ollama` | Not required for local Ollama |
| DeepSeek | `deepseek` | `DEEPSEEK_API_KEY` |
| OpenAI | `openai` | `OPENAI_API_KEY` |
| Google Gemini | `gemini` | `GEMINI_API_KEY` |
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` |

Example:

```sh
node dist/bin/polyclaw.js --provider openai --model gpt-4o "Review this project structure"
```

Pass secrets through environment variables or a secure local configuration. Avoid committing API keys to source control.

## CLI options

```text
polyclaw [prompt...]
  -p, --provider <provider>   ollama, deepseek, openai, gemini, anthropic
  -m, --model <model>         Model identifier
  -k, --api-key <key>         API key override
  -u, --base-url <url>        Endpoint base URL override
  -s, --max-steps <number>    Maximum execution loop steps
```

When running from a source checkout, replace `polyclaw` with `node dist/bin/polyclaw.js`.

## Configuration profile

PolyClaw can read `~/.PolyClawrc.json`. Example:

```json
{
  "defaultProvider": "ollama",
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434",
      "defaultModel": "deepseek-r1:8b"
    },
    "openai": {
      "apiKey": "env:OPENAI_API_KEY",
      "defaultModel": "gpt-4o"
    }
  }
}
```

Use `env:VARIABLE_NAME` to refer to an environment variable rather than putting a secret directly in the profile.

## Roadmap

- [x] Provider configuration fixes and automated test workflow
- [x] Approval-gated shell-command tool with an initial safety policy
- [x] Preview diffs and require approval before file writes
- [x] Provider failure messages with actionable troubleshooting hints
- [ ] End-to-end tests against a live local Ollama instance in CI
- [ ] More comprehensive, reviewable tool permissions

## Contributing

Bug reports, tests, documentation improvements, and provider fixes are welcome. Please describe what you tested and distinguish verified behavior from planned functionality.

## License

PolyClaw is distributed under the [MIT License](LICENSE).
