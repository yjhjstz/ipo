# Environment Variables

## Provider Selection

| Variable | Default | Description |
|----------|---------|-------------|
| `PROVIDER` | auto | Backend provider: `anthropic` or `openai`. Auto-detected from available API keys if not set. |

**Auto-detection logic**: if `OPENAI_API_KEY` is set and no Anthropic credentials are present, defaults to `openai`. Otherwise defaults to `anthropic`.

## Anthropic Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key (`sk-ant-...`) |
| `ANTHROPIC_API_KEY_OVERRIDE` | No | Override API key (takes priority, used in SWE_BENCH mode) |
| `ANTHROPIC_BASE_URL` | No | Custom API endpoint (default: `https://api.anthropic.com`) |
| `ANTHROPIC_MODEL` | No | Override main model (e.g., `claude-opus-4-6`) |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | No | Opus-tier model override |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | No | Sonnet-tier model override |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | No | Haiku-tier model override |
| `CLAUDE_CODE_USE_BEDROCK` | No | Enable AWS Bedrock backend |
| `CLAUDE_CODE_USE_VERTEX` | No | Enable Google Vertex AI backend |
| `CLOUD_ML_REGION` | `us-east5` | GCP region for Vertex AI |

## OpenAI-Compatible Backend

Use with any OpenAI-compatible API (OpenAI, AnyRouter, local servers, etc.).

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | API key for the OpenAI-compatible provider |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Custom API endpoint |
| `OPENAI_MODEL` | - | Override main model (e.g., `gpt-4.1`) |
| `OPENAI_DEFAULT_MODEL` | `gpt-4.1` | Default primary model |
| `OPENAI_SMALL_MODEL` | - | Haiku-tier model override |
| `OPENAI_DEFAULT_HAIKU_MODEL` | `gpt-4.1-mini` | Default haiku-tier (fast) model |

> For Anthropic-compatible proxies (GLM, Ollama via Anthropic adapter, AnyRouter), use the `ANTHROPIC_*` variables instead, since they speak the Anthropic API format.

## Model Selection (shared)

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_MAX_OUTPUT_TOKENS` | - | Override max output tokens for any model |
| `ANTHROPIC_CONTEXT_WINDOW` | - | Override context window size for any model |
| `MAX_THINKING_TOKENS` | - | Extended thinking token limit |
| `THINK_TOOL` | - | Set to `1` to enable extended thinking |

## Proxy & Network

| Variable | Default | Description |
|----------|---------|-------------|
| `SOCKS_PROXY` | - | SOCKS5 proxy URL (e.g., `socks5://127.0.0.1:1080`) |
| `SOCKS5_PROXY` | - | Alternative SOCKS5 proxy format |
| `API_TIMEOUT_MS` | `60000` | API request timeout in milliseconds |

## Gemini ACP Integration

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model for `/gemini` command and `model: gemini` skills |

See [Gemini ACP Integration](/advanced/gemini-acp) for setup details.

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

## Configuration Paths

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_CONFIG_DIR` | `~/.quantwise` | Override config directory |

## Feature Flags

| Variable | Description |
|----------|-------------|
| `DISABLE_PROMPT_CACHING` | Disable prompt cache optimization |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | Disable non-essential network requests |
| `CLAUDE_CODE_SIMPLE` | Enable simple mode (limited tool set) |
| `USE_BUILTIN_RIPGREP` | Use bundled ripgrep binary instead of system one |
