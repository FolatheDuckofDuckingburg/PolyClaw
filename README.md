# 🦀 PolyClaw


**The open-source, model-agnostic CLI coding agent.**  
*Autonomous file editing, shell execution, and code analysis—powered by any local or cloud LLM.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)


---

</div>

## 🔍 Why PolyClaw?

**PolyClaw** is a vendor-independent fork of Claude Code. While the original tool locks terminal agentics into a single proprietary ecosystem, PolyClaw provides a modular, model-agnostic layer that routes autonomous execution across local open-weights, proprietary cloud APIs, and custom enterprise inference endpoints.

| Feature | Claude Code | 🦀 PolyClaw |
| :--- | :---: | :---: |
| **Primary Provider** | Anthropic Claude | **Any Provider** (Ollama, DeepSeek, OpenAI, Gemini, Claude) |
| **Offline / Local Mode** | ❌ No | **✅ Yes** (via Ollama / LM Studio) |
| **Multi-Model Routing** | ❌ Locked | **✅ Dynamic** (per command, file, or project context) |
| **License** | Proprietary | **✅ MIT (100% Open Source)** |

---

## ⚡ Quick Start

### Global Installation via package managers

```
# Install via npm globally
npm install -g polyclaw-cli

# Or install via pnpm
pnpm add -g polyclaw-cli
```

### Building from Source

```
# Clone the repository
git clone https://github.com/FolatheDuckofDuckingburg/PolyClaw.git
cd PolyClaw

# Install dependencies and build the TypeScript distribution
pnpm install
pnpm build

# Link the binary locally for development testing
npm link
```

---

## ⚙️ Configuration & Providers

PolyClaw looks for credentials and routing preferences via environment variables or a static system profile.

### 1. Environment Variable Setup

#### Local Models via Ollama (Free, Private & Fully Offline)
```
export PolyClaw_PROVIDER=ollama
export PolyClaw_MODEL=deepseek-r1:8b
export OLLAMA_HOST=http://localhost:11434
```

#### DeepSeek API (Cloud Inference)
```
export PolyClaw_PROVIDER=deepseek
export PolyClaw_MODEL=deepseek-coder
export DEEPSEEK_API_KEY=your_key_here
```

#### Alternative Cloud Providers
```
# OpenAI
export PolyClaw_PROVIDER=openai
export PolyClaw_MODEL=gpt-4o
export OPENAI_API_KEY=your_key_here

# Google Gemini
export PolyClaw_PROVIDER=gemini
export PolyClaw_MODEL=gemini-1.5-pro
export GEMINI_API_KEY=your_key_here

# Anthropic Claude
export PolyClaw_PROVIDER=anthropic
export PolyClaw_MODEL=claude-3-5-sonnet-20241022
export ANTHROPIC_API_KEY=your_key_here
```

### 2. Configuration Profile File (`~/.PolyClawrc.json`)

Avoid managing temporary terminal variables by persisting your settings directly:

```
{
  "defaultProvider": "ollama",
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434",
      "defaultModel": "deepseek-r1:8b"
    },
    "deepseek": {
      "apiKey": "env:DEEPSEEK_API_KEY",
      "defaultModel": "deepseek-coder"
    },
    "openai": {
      "apiKey": "env:OPENAI_API_KEY",
      "defaultModel": "gpt-4o"
    }
  },
  "settings": {
    "autoApproveCommands": false,
    "theme": "dark"
  }
}
```

---

## 🚀 Usage Examples

```
# Initialize an interactive REPL terminal session
PolyClaw

# Run a single autonomous execution pass (One-shot execution)
PolyClaw "Refactor src/utils.ts to handle async retries with exponential backoff"

# Dynamically override the configuration router on the fly
PolyClaw --provider deepseek --model deepseek-coder "Fix failing unit tests in tests/auth.test.ts"
```

---

## 🤝 Contributing

Contributions are highly appreciated! If you want to add new LLM provider integrations, enhance the file-editing parsing logic, or optimize terminal streaming latency:

1. Fork the repository.
2. Create a clean feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your refactored code changes (`git commit -m 'Add support for custom provider context window adjustments'`).
4. Push to the remote branch (`git push origin feature/AmazingFeature`).
5. Open a formal Pull Request against the `main` branch.

---

## 📄 License

PolyClaw is distributed under the **MIT License**. See the `LICENSE` file for full compliance details.
