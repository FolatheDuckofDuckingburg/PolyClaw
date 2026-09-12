# 🦀 PolyClaw

> **The open-source, model-agnostic CLI coding agent.**  
> Autonomous file editing, shell execution, and code analysis—powered by any LLM.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## 🔍 Why PolyClaw?

**PolyClaw** is a vendor-independent fork of Claude Code. While the original tool locks terminal agentics into a single provider, PolyClaw provides a model-agnostic layer that routes agentic execution across local open-weights, proprietary cloud APIs, and custom enterprise endpoints.

| Feature | Claude Code | PolyClaw |
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
npm install -g PolyClaw

# Or via pnpm
pnpm add -g PolyClaw

git clone [https://github.com/FolatheDuckofDuckingburg/PolyClaw.git](https://github.com/FolatheDuckofDuckingburg/PolyClaw.git)
cd PolyClaw
pnpm install
pnpm build
npm link
```
## ⚙️ Configuration & Providers

### Local Models via Ollama (Free & Offline)
```
export PolyClaw_PROVIDER=ollama
export PolyClaw_MODEL=deepseek-r1:8b
export OLLAMA_HOST=http://localhost:11434
```

### DeepSeek API
```
export PolyClaw_PROVIDER=deepseek
export PolyClaw_MODEL=deepseek-coder
export DEEPSEEK_API_KEY=your_key_here
```

### OpenAI
```
export PolyClaw_PROVIDER=openai
export PolyClaw_MODEL=gpt-4o
export OPENAI_API_KEY=your_key_here
```

### Google Gemini
```
export PolyClaw_PROVIDER=gemini
export PolyClaw_MODEL=gemini-1.5-pro
export GEMINI_API_KEY=your_key_here
```

### Anthropic Claude
```
export PolyClaw_PROVIDER=anthropic
export PolyClaw_MODEL=claude-3-5-sonnet-20241022
export ANTHROPIC_API_KEY=your_key_here
```

## 📄 Configuration File (~/.PolyClawrc.json)
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
PolyClaw

# One-shot command execution
PolyClaw "Refactor src/utils.ts to handle async retries"

# Override provider on the fly
PolyClaw --provider deepseek --model deepseek-coder "Fix failing unit tests in tests/auth.test.ts"
```
-----
## 📄 License

PolyClaw is released under the MIT License.

