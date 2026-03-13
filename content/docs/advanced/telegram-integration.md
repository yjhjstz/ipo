# Telegram Integration

QuantWise can connect to Telegram for receiving alerts and controlling your analysis remotely.

## Commands

| Command | Description |
|---------|-------------|
| `/telegram start` | Start Telegram bot |
| `/telegram stop` | Stop Telegram bot |
| `/telegram status` | Check bot status |
| `/telegram send <message>` | Send a message via bot |

## Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the prompts
3. Save the bot token

### 2. Configure Environment

Add to your `.env` or environment variables:

```bash
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_OWNER_CHAT_ID="your-chat-id"
```

> **Note:** When both variables are set, the Telegram bot auto-starts with QuantWise — no need to run `/telegram start` manually.

### 3. Start the Bot

```bash
/telegram start
```

## Use Cases

### Market Alerts
Combine with loop tasks for automated alerts:

```bash
/loop 1h "Run /market-top-detector and if score > 60, /telegram send 'ALERT: Market top risk elevated'"
```

### Portfolio Updates
```bash
/loop 1d "Run /portfolio-manager and /telegram send the summary"
```

### Remote Commands
Send commands to QuantWise via Telegram messages when the bot is active.

## Architecture

```
Telegram App (mobile/desktop)
    ↕ Bot API
Telegram Bot Service
    ↕ Webhook/Polling
QuantWise CLI (local)
    ↕
Analysis Engine + MCP Tools
```
