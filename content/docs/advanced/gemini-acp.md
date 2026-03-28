# Gemini ACP Integration

Integrate Google Gemini CLI into QuantWise as a subprocess via ACP (Agent Control Protocol) for cross-model collaboration.

## Features

- `/gemini <prompt>` — Send prompts directly to Gemini and stream responses
- Built-in Google Search — Gemini can fetch real-time web data
- Skill `model: gemini` routing — Any skill declaring `model: gemini` automatically routes through the ACP bridge
- Telegram Bot menu — Two-step invocation for remote usage

## Prerequisites

1. Install Gemini CLI:
   ```bash
   npm install -g @google/gemini-cli
   ```

2. Complete OAuth login:
   ```bash
   gemini
   # First run will guide you through Google OAuth authorization
   ```

3. Verify installation:
   ```bash
   gemini -p "hello"
   ```

## Usage

### 1. `/gemini` Command

Use directly in a QuantWise interactive session:

```
/gemini what are the S&P 500 closing prices today
/gemini search for latest NVIDIA earnings report
/gemini analyze current macro environment impact on tech stocks
```

Gemini automatically decides when to invoke Google Search. To force a search, explicitly say "search" in your prompt.

### 2. Skill Routing

Declare `model: gemini` in a skill's frontmatter to route execution through the ACP bridge instead of the Claude query loop:

```yaml
---
name: my-gemini-skill
description: Search latest market news via Gemini
model: gemini
user-invocable: true
argument-hint: "search keywords"
---

Use Google Search to find the latest news on the following topic and summarize:

$ARGUMENTS
```

Invoke: `/my-gemini-skill NVIDIA earnings`

**Suitable for**: Prompt-only skills that do not depend on QuantWise MCP tools.

**Not suitable for**: Skills requiring MCP tools (e.g., `mcp__stock-analysis__*`, `mcp__notion__*`), since the Gemini subprocess cannot access QuantWise's MCP servers.

### 3. Telegram Bot

Use Gemini via the Telegram bot menu (two-step flow):

1. Tap `/gemini` in the bot menu
2. Bot replies with a prompt asking for your question
3. Type your question and wait for the response

Or send directly: `/gemini what is AAPL stock price`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model name |

Example:
```bash
export GEMINI_MODEL=gemini-2.5-pro
```

## Architecture

```
QuantWise CLI
  |
  +-- /gemini command ----------+
  +-- skill (model: gemini) ---+
  +-- Telegram bot ------------+
                               |
                               v
                        runACPPrompt()
                               |
                               v
                        ACPClient.getInstance('gemini')
                               |
                               v
                        spawn('gemini', ['--acp', '--yolo', '-m', model])
                               |
                               v
                        ACP ndjson/stdio bidirectional communication
                               |
                               v
                        Gemini CLI (Google Search, code tools, etc.)
```

Key files:

| File | Responsibility |
|------|----------------|
| `src/services/acpClient.ts` | ACP protocol client, process management, `runACPPrompt()` shared helper |
| `src/commands/gemini.ts` | `/gemini` slash command |
| `src/skills/commands.ts` | Skill `model` field routing logic |

## ACP Protocol

ACP (Agent Control Protocol) communicates via JSON-RPC 2.0 over ndjson/stdio:

- **Session management**: `newSession` creates sessions with multi-turn conversation memory
- **Push notifications**: `sessionUpdate` streams text chunks, thoughts, and tool call events in real time
- **Permission proxy**: `--yolo` mode auto-approves all tool calls
- **Session lock**: Serializes prompt calls within the same session to prevent message misrouting

## Adding More ACP Agents

The `PROVIDERS` config in `acpClient.ts` supports adding more ACP-compatible agents:

```typescript
const PROVIDERS: Record<string, ProviderConfig> = {
  gemini: {
    command: 'gemini',
    args: ['--acp', '--yolo', '-m', process.env.GEMINI_MODEL || 'gemini-2.5-flash'],
    authMethodId: 'oauth-personal',
  },
  // Add more providers here...
}
```

Once added, set a skill's `model` field to the provider name to route execution through it.
