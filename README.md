# 🦀 PolyClaw

**An open-source, model-flexible terminal coding assistant.** Run local models through Ollama or connect a supported hosted provider.

PolyClaw is designed to make model choice yours. The CLI itself is free and MIT-licensed; local inference can avoid per-request API charges, while hosted model providers may charge separately.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> PolyClaw is an independent project and is not affiliated with or endorsed by Anthropic or any other model provider.

## Why PolyClaw?

- **Local-first option:** run a model on your own computer with Ollama.
- **Provider choice:** Ollama, DeepSeek, OpenAI, Gemini, and Anthropic are supported by the current provider adapter.
- **Terminal workflow:** give Poly a coding task in one command or use the interactive REPL.
- **Open source:** inspect and modify the project under the MIT License.

### What it can do today

The current agent can read and write text files within the working project workspace and use a lightweight knowledge graph to keep track of codebase context.

**Current limitations:** shell-command execution, automatic per-file model routing, and a full permission/approval UI are not yet implemented. Do not assume PolyClaw can run tests or build commands on your behalf yet. These are development goals, not current features.

## Quick start: local model, no hosted API key

### 1. Install the prerequisites

- [Node.js](https://nodejs.org/) (Node 22 recommended)
- [Ollama](https://ollama.com/download)

Install and start Ollama, then download a model. The default model is `deepseek-r1:8b`; it may require substantial RAM. Choose a smaller model if your computer cannot run it comfortably.

```sh
ollama pull deepseek-r1:8b
```

The initial model download requires an internet connection. Once downloaded, inference runs locally; Ollama does not require a hosted model API key for this setup.

### 2. Install and build PolyClaw

```sh
git clone https://github.com/FolatheDuckofDuckingburg/PolyClaw.git
cd PolyClaw
npm install
npm run build
```

### 3. Ask Poly a coding question

```sh
node dist/bin/polyclaw.js --provider ollama --model deepseek-r1:8b "Explain the structure of this project"
```

Or start the interactive terminal:

```sh
node dist/bin/polyclaw.js --provider ollama --model deepseek-r1:8b
```

Type `exit` or `quit` to leave the REPL.

### Windows PowerShell

The commands above work in PowerShell too. If Ollama is installed and running locally, no API-key environment variable is needed for the local setup.

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

- [ ] Reliable provider configuration and automated tests
- [ ] Explicit, reviewable tool permissions
- [ ] Safe shell-command tool with workspace-aware safeguards
- [ ] End-to-end tests against a local Ollama instance
- [ ] Better patch previews and file-edit diffs
- [ ] Clear recovery and error reporting

## Contributing

Bug reports, tests, documentation improvements, and provider fixes are welcome. Please describe what you tested and distinguish verified behavior from planned functionality.

## License

PolyClaw is distributed under the [MIT License](LICENSE).
