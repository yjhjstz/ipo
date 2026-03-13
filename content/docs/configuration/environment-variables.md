# Environment Variables

## Core Authentication

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Primary API key (`sk-ant-...`) |
| `ANTHROPIC_API_KEY_OVERRIDE` | No | Override API key (takes priority) |
| `ANTHROPIC_AUTH_TOKEN` | Alt | OAuth bearer token authentication |
| `ANTHROPIC_BASE_URL` | No | Custom API endpoint (default: `https://api.anthropic.com`) |

## Model Selection

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_MODEL` | Auto | Override main model (e.g., `claude-opus-4-6`, `glm-4.7`) |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | - | Opus-tier model override (e.g., `glm-5`) |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | - | Sonnet-tier model override (e.g., `glm-4.7`) |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | - | Haiku-tier model override (e.g., `glm-4.5-air`) |
| `ANTHROPIC_MAX_OUTPUT_TOKENS` | - | Override max output tokens for any model |
| `ANTHROPIC_CONTEXT_WINDOW` | - | Override context window size for any model |
| `MAX_THINKING_TOKENS` | - | Extended thinking token limit |
| `THINK_TOOL` | - | Set to `1` to enable extended thinking |
| `CLAUDE_CODE_USE_BEDROCK` | `false` | Enable AWS Bedrock backend |
| `CLAUDE_CODE_USE_VERTEX` | `false` | Enable Google Vertex AI backend |
| `CLOUD_ML_REGION` | `us-east5` | GCP region for Vertex AI |

## Proxy & Network

| Variable | Default | Description |
|----------|---------|-------------|
| `SOCKS_PROXY` | - | SOCKS5 proxy URL (e.g., `socks5://127.0.0.1:1080`) |
| `SOCKS5_PROXY` | - | Alternative SOCKS5 proxy format |
| `API_TIMEOUT_MS` | `60000` | API request timeout in milliseconds |

## External Services

| Variable | Description |
|----------|-------------|
| `FMP_API_KEY` | Financial Modeling Prep API key (for trading skills) |
| `TAVILY_API_KEY` | Tavily web search API key (used by WebSearch tool) |
| `GROQ_API_KEY` | Groq API key (used for Telegram voice message transcription via Whisper) |

## Telegram Integration

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from @BotFather |
| `TELEGRAM_OWNER_CHAT_ID` | Owner's numeric Telegram chat ID |

When both are set, the Telegram bot **auto-starts** with QuantWise — no need to run `/telegram start` manually.

## Remote Control

| Variable | Description |
|----------|-------------|
| `REMOTE_TOKEN` | Secret token for remote control API authentication (strongly recommended) |

## Browser Relay

| Variable | Default | Description |
|----------|---------|-------------|
| `BROWSER_RELAY_TOKEN` | - | Auth token shared between QuantWise and Chrome extension |
| `BROWSER_RELAY_PORT` | `18792` | Browser relay server port |

## Configuration Paths

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_CONFIG_DIR` | `~/.claude` | Override config directory |

## Feature Flags

| Variable | Description |
|----------|-------------|
| `DISABLE_PROMPT_CACHING` | Disable prompt cache optimization |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | Disable non-essential network requests |
| `CLAUDE_CODE_SIMPLE` | Enable simple mode (limited tool set) |
| `USE_BUILTIN_RIPGREP` | Use bundled ripgrep binary instead of system one |
