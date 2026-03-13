# Telegram Bot Setup

This guide walks you through creating a Telegram bot and obtaining the two environment variables needed for QuantWise's Telegram integration:

- `TELEGRAM_BOT_TOKEN` — authenticates your bot with the Telegram API
- `TELEGRAM_OWNER_CHAT_ID` — identifies which chat receives messages

## Step 1: Create a Bot with BotFather

1. Open Telegram and search for **@BotFather** (the official bot-management bot).
2. Start a conversation and send:
   ```
   /newbot
   ```
3. BotFather will ask you for a **display name** (e.g., `QuantWise Bot`).
4. Then it will ask for a **username** — this must end in `bot` (e.g., `quantwise_alerts_bot`).
5. Once created, BotFather will reply with your **bot token**:
   ```
   Use this token to access the HTTP API:
   123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
   ```
6. Copy this token — this is your `TELEGRAM_BOT_TOKEN`.

## Step 2: Get Your Chat ID

You need the chat ID of the conversation where you want the bot to send messages (typically your personal chat with the bot).

### Option A: Message the Bot Directly

1. Open Telegram and find your new bot by its username.
2. Press **Start** or send any message (e.g., `hello`).
3. Open this URL in your browser (replace `<YOUR_TOKEN>` with your bot token):
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
4. You'll see a JSON response. Look for:
   ```json
   "chat": {
     "id": 987654321,
     ...
   }
   ```
5. The `id` value (e.g., `987654321`) is your `TELEGRAM_OWNER_CHAT_ID`.

### Option B: Use @userinfobot

1. Search for **@userinfobot** on Telegram.
2. Start the bot and it will immediately reply with your user info including your **numeric ID**.
3. Use that ID as your `TELEGRAM_OWNER_CHAT_ID`.

### Option C: Group Chat

If you want the bot to send messages to a **group**:

1. Add the bot to the group.
2. Send a message in the group.
3. Visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` and find the group chat ID (it will be a negative number like `-1001234567890`).

## Step 3: Configure QuantWise

Add both variables to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
export TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
export TELEGRAM_OWNER_CHAT_ID="987654321"
```

Or add them to your `.env` file in the project root.

Then reload your shell:

```bash
source ~/.zshrc
```

## Step 4: Verify

Start QuantWise and test the integration:

```
/telegram status
```

You should see the bot is connected. Then send a test message:

```
/telegram send Hello from QuantWise!
```

Check your Telegram — you should receive the message.

## Using with /loop

Once configured, combine Telegram with scheduled tasks:

```
/loop 24h search financial news and send summary via /telegram send
/loop 1h check build status and notify via /telegram send
```

See the [Loop — Scheduled Tasks](/docs) documentation for more examples.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `401 Unauthorized` | Your bot token is invalid. Regenerate it via BotFather (`/token`). |
| Empty `getUpdates` response | Send a message to the bot first, then check again. |
| Bot doesn't respond | Make sure you pressed **Start** in the bot chat. |
| Group messages not received | Ensure the bot has been added to the group and [privacy mode](https://core.telegram.org/bots/features#privacy-mode) is disabled if needed (use `/setprivacy` in BotFather). |
| Chat ID is `0` or missing | Double-check the JSON from `getUpdates` — make sure you're looking at the correct `chat.id` field. |

## BotFather Quick Reference

| Command | Description |
|---------|-------------|
| `/newbot` | Create a new bot |
| `/token` | Regenerate bot token |
| `/setname` | Change bot display name |
| `/setdescription` | Set bot description |
| `/setabouttext` | Set "About" text |
| `/setuserpic` | Set bot profile picture |
| `/deletebot` | Delete a bot |
