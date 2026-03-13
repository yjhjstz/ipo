# Loop — Scheduled Tasks

The `/loop` command lets you create recurring tasks that run automatically at fixed intervals. It's ideal for monitoring, automated reporting, and any prompt you want executed on a schedule.

## Syntax

```
/loop [interval] <prompt>
```

The interval can be placed before the prompt, or QuantWise will parse natural language like "every 2h".

### Interval Formats

| Format | Meaning |
|--------|---------|
| `5m` or `5min` | Every 5 minutes |
| `1h` or `1hrs` | Every 1 hour |
| `2d` | Every 2 days |
| *(omitted)* | Default: **every 10 minutes** |

## Managing Loops

| Command | Description |
|---------|-------------|
| `/loop list` | List all active loop tasks with IDs and next fire time |
| `/loop cancel <id>` | Cancel a specific loop task |
| `/loop cancel all` | Cancel all loop tasks |

## Examples

### Financial News Digest

Push a daily financial news summary to Telegram:

```
/loop 24h search recent financial news including stocks, bonds, forex, commodities, and economic data, then send a concise news digest via /telegram send
```

This creates a cron task that:
1. Searches for the latest 24-hour financial news
2. Generates a structured summary with title, description, market impact, and related assets
3. Delivers the digest to your Telegram channel

![Financial News — headline and summary](/images/telegram/bot-news-1.jpg)
![Financial News — market data and risk analysis](/images/telegram/bot-news-2.jpg)

### Daily English Lessons

Receive practical English expressions every day:

```
/loop 24h teach me 2 practical English expressions with meaning, usage scenario, example sentence, and pronunciation tips, then send via /telegram send
```

![Daily English lesson delivered via Telegram](/images/telegram/bot-english.jpg)

### More Use Cases

```
# Monitor market movers every 5 minutes
/loop 5m /market-top-detector

# Check build status hourly
/loop 1h check build status and notify me if any failures

# Watch for new GitHub issues (natural language interval)
/loop check for new issues every 2h

# Default interval (10 minutes)
/loop check build

# Weekly trade strategy report
/loop 7d run /weekly-trade-strategy and send summary via /telegram send
```

## How It Works

1. When you run `/loop`, QuantWise registers a background cron task.
2. Tasks are persisted to `.claude/cron-tasks.json` so they survive across the session.
3. At each interval, the prompt is executed via the session bridge as if you typed it.
4. A small **jitter** (±10% of the interval, max 15 minutes) is added to avoid thundering herd effects.
5. Combined with `/telegram send`, loop outputs can be delivered to your Telegram bot automatically.
6. Use `/loop list` to see active tasks and `/loop cancel` to stop them.

## Task Persistence

Loop tasks are stored in `.claude/cron-tasks.json`:

```json
{
  "id": "abc123",
  "cron": "*/10 * * * *",
  "prompt": "/market-top-detector",
  "recurring": true,
  "createdAt": 1700000000000,
  "lastFiredAt": 1700003600000,
  "nextFireAt": 1700007200000
}
```

The scheduler checks every second and supports standard 5-field cron expressions (`minute hour day month day-of-week`).

## Tips

- **Combine with Telegram**: Append `/telegram send` to your prompt to push results to Telegram automatically.
- **Use slash commands in prompts**: You can chain any skill or slash command inside a loop prompt (e.g., `/market-top-detector`, `/weekly-trade-strategy`).
- **Natural language intervals**: You can write intervals naturally — `"every 2h"`, `"every 30 minutes"` — QuantWise will parse them.
- **Default interval**: If you omit the interval, it defaults to 10 minutes.
- **Monitor costs**: Each loop iteration consumes API tokens. Use `/cost` to track usage.
