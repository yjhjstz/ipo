# Telegram Integration

QuantWise connects to Telegram for receiving alerts, sending analysis results, and controlling your session remotely — including text, voice messages, and photos.

## Commands

| Command | Description |
|---------|-------------|
| `/telegram start` | Start Telegram bot |
| `/telegram stop` | Stop Telegram bot |
| `/telegram status` | Check bot status and message count |
| `/telegram send <message>` | Send a message via bot |
| `/telegram help` | Show Telegram command help |

## Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the prompts
3. Save the bot token

See [Telegram Bot Setup](/docs) for a detailed step-by-step guide.

### 2. Configure Environment

```bash
export TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
export TELEGRAM_OWNER_CHAT_ID="987654321"
```

> **Auto-start:** When both variables are set, the Telegram bot starts automatically with QuantWise — no need to run `/telegram start` manually.

### 3. Manual Start (Optional)

If env vars are not set at startup:

```
/telegram start
```

## Features

### Text Messages
Send a text message to the bot and it will be processed as a prompt in your QuantWise session. The response is sent back to you in Telegram.

### Voice Messages
Send a voice note to the bot — it will be transcribed to text via **Groq Whisper** (requires `GROQ_API_KEY`) and then processed as a prompt.

### Photo Messages
Send a photo (with optional caption) to the bot — it will be downloaded and processed using Claude's vision capabilities.

### Message Formatting
- Responses are formatted in **MarkdownV2** for rich display
- Automatic fallback to plain text if Markdown formatting fails
- Messages longer than **4096 characters** are automatically split into multiple messages

### Owner-Only Security
Only messages from `TELEGRAM_OWNER_CHAT_ID` are processed. All other messages are silently ignored.

### Typing Indicator
The bot shows "typing..." while QuantWise is processing your request.

### Message Queue
If you send multiple messages while QuantWise is busy, they are queued and processed in order.

### Cron Integration
Results from `/loop` tasks are automatically forwarded to Telegram when the bot is active.

## Use Cases

### Market Alerts

```
/loop 1h "Run /market-top-detector and if score > 60, /telegram send 'ALERT: Market top risk elevated'"
```

### Portfolio Updates

```
/loop 1d "Run /portfolio-manager and /telegram send the summary"
```

### Financial News Digest

```
/loop 24h search financial news and send summary via /telegram send
```

### Remote Commands
Send any command or prompt to QuantWise via Telegram messages when the bot is active — effectively turning Telegram into a remote terminal.

## Architecture

```
Telegram App (mobile/desktop)
    ↕ Bot API (long-polling, 30s timeout)
Telegram Bot Client (no external dependencies)
    ↕ Text / Voice / Photo handlers
Session Bridge
    ↕ Prompt processing
QuantWise CLI Session
    ↕
Analysis Engine + MCP Tools
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Bot token from @BotFather |
| `TELEGRAM_OWNER_CHAT_ID` | Yes | Owner's numeric chat ID |
| `GROQ_API_KEY` | No | Required for voice message transcription |
