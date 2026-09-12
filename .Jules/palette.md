## 2026-09-12 - Interactive CLI Guidance & REPL Built-in Commands
**Learning:** In CLI/REPL interfaces, users often type common navigation/help commands like `help`, `?`, or `clear`. Without built-in handlers, these inputs are passed as raw prompts to the LLM agent, consuming API tokens/time and producing unexpected agent outputs.
**Action:** Always intercept standard CLI control commands (`help`, `?`, `clear`) in REPL loops to provide immediate, zero-latency user guidance and terminal control.
