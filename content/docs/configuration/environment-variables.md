# Environment Variables

## Core Authentication

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Primary API key (`sk-ant-...`) |
| `ANTHROPIC_AUTH_TOKEN` | Alt | Bearer token authentication |
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
| `CLAUDE_CODE_USE_BEDROCK` | `false` | Enable AWS Bedrock backend |
| `CLAUDE_CODE_USE_VERTEX` | `false` | Enable Google Vertex AI backend |
| `CLOUD_ML_REGION` | `us-east5` | GCP region for Vertex AI |
| `MAX_THINKING_TOKENS` | - | Extended thinking token limit |

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
| `TAVILY_API_KEY` | Tavily web search API key |
| `GROQ_API_KEY` | Groq fast inference API key |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token for notifications (auto-starts bot if set with chat ID) |
| `TELEGRAM_OWNER_CHAT_ID` | Telegram owner chat ID (numeric) |
| `TUNNEL_URL` | Public tunnel URL for `/remote-control` internet access |
| `TUNNEL_TOKEN` | Secret token for remote control API authentication |
| `BROWSER_RELAY_TOKEN` | Browser relay authentication token |
| `BROWSER_RELAY_PORT` | Browser relay port (default: `18792`) |

## Configuration Paths

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_CONFIG_DIR` | `~/.claude` | Override config directory |

## Feature Flags

| Variable | Description |
|----------|-------------|
| `DISABLE_PROMPT_CACHING` | Disable prompt cache optimization |
| `MAX_THINKING_TOKENS` | Set extended thinking token limit |
