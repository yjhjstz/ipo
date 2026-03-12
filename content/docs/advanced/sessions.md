# Sessions & Conversations

QuantWise maintains conversation history and supports session management for continuous workflows.

## Session Commands

| Command | Description |
|---------|-------------|
| `/clear` | Clear conversation history and free context |
| `/compact` | Clear history but keep an AI-generated summary |
| `/resume` | Resume a previous conversation |
| `/rename <name>` | Rename the current conversation |
| `/rewind` | Rewind conversation to a previous point |

## Session Lifecycle

```
Start Session → Conversation → Compact/Clear → End Session
                     ↑                              ↓
                     └──── /resume ────────────────┘
```

## Resuming Sessions

Sessions are saved automatically. Use `/resume` to pick up where you left off:

```bash
# List recent sessions
/resume

# The session includes:
# - Full conversation history
# - Analysis results
# - File modifications made
# - Tool execution context
```

## Context Management

QuantWise has a context window that fills as conversations progress. Manage it effectively:

### Check Context Usage
```bash
/ctx-viz    # Visualize context token usage breakdown
```

### Free Context Space
```bash
/compact    # Summarize and compress history (recommended)
/clear      # Completely clear history (loses all context)
```

### Best Practices

1. **Use `/compact` before complex tasks** — frees space while retaining key context
2. **Start new sessions for unrelated work** — keeps context focused
3. **Use `/rename`** to label sessions for easy resume later
4. **Monitor with `/ctx-viz`** — watch for context approaching limits

## Session Cost Tracking

```bash
/cost    # Show session cost and duration
```

Displays:
- Total tokens used (input + output)
- Estimated session cost
- Session duration
- Tool calls made

## Remote Sessions

QuantWise supports remote access via HTTP tunnel:

```bash
/remote-control [port]    # Start HTTP server + Cloudflare tunnel
```

This creates a public URL for accessing QuantWise remotely, useful for:
- Mobile access to your trading terminal
- Sharing live analysis sessions
- Remote monitoring of market conditions

## Loop Tasks

Run recurring analysis on a schedule within a session:

```bash
/loop 5m /market-top-detector          # Check every 5 minutes
/loop 1h /portfolio-manager            # Hourly portfolio check
/loop list                             # List active loops
/loop cancel all                       # Stop all loops
```

### Interval Formats
- `5m` — 5 minutes
- `1h` — 1 hour
- `2d` — 2 days
