# 🦀 polyclaw

> **The open-source, model-agnostic CLI coding agent.**  
> Autonomous file editing, shell execution, and code analysis—powered by any LLM.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## 🔍 Why polyclaw?

**polyclaw** is a vendor-independent fork of Claude Code. While the original tool locks terminal agentics into a single provider, PolyClaw provides a model-agnostic layer that routes agentic execution across local open-weights, proprietary cloud APIs, and custom enterprise endpoints.

| Feature | Claude Code | polyclaw |
| :--- | :--- | :--- |
| **Primary Provider** | Anthropic Claude | **Any Provider** (Ollama, DeepSeek, OpenAI, Gemini, Claude) |
| **Offline / Local Mode** | ❌ No | **✅ Yes** (via Ollama / LM Studio) |
| **Multi-Model Routing** | ❌ Locked | **✅ Dynamic** (per command or project) |
| **License** | Proprietary | **✅ MIT (Open Source)** |

---

## ⚡ Quick Start

### Installation

```
# Global installation via npm
npm install -g polyclaw

# Or via pnpm
pnpm add -g polyclaw

git clone [https://github.com/FolatheDuckofDuckingburg/polyclaw.git](https://github.com/FolatheDuckofDuckingburg/polyclaw.git)
cd polyclaw
pnpm install
pnpm build
npm link
```
## ⚙️ Configuration & Providers

### Local Models via Ollama (Free & Offline)
```
export POLYCLAW_PROVIDER=ollama
export POLYCLAW_MODEL=deepseek-r1:8b
export OLLAMA_HOST=http://localhost:11434
```

### DeepSeek API
```
export POLYCLAW_PROVIDER=deepseek
export POLYCLAW_MODEL=deepseek-coder
export DEEPSEEK_API_KEY=your_key_here
```

### OpenAI
```
export POLYCLAW_PROVIDER=openai
export POLYCLAW_MODEL=gpt-4o
export OPENAI_API_KEY=your_key_here
```

### Google Gemini
```
export POLYCLAW_PROVIDER=gemini
export POLYCLAW_MODEL=gemini-1.5-pro
export GEMINI_API_KEY=your_key_here
```

### Anthropic Claude
```
export POLYCLAW_PROVIDER=anthropic
export POLYCLAW_MODEL=claude-3-5-sonnet-20241022
export ANTHROPIC_API_KEY=your_key_here
```

## 📄 Configuration File (~/.polyclawrc.json)
You can save provider configurations locally instead of managing environment variables:
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
## 🚀 Usage Examples
```
# Interactive REPL session
polyclaw

# One-shot command execution
polyclaw "Refactor src/utils.ts to handle async retries"

# Override provider on the fly
polyclaw --provider deepseek --model deepseek-coder "Fix failing unit tests in tests/auth.test.ts"
```
-----
## 📄 License

polyclaw is released under the MIT License.

