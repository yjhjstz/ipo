# Configuration Files

QuantWise uses several configuration files stored in `~/.claude/` (or `$CLAUDE_CONFIG_DIR`).

## Directory Structure

```
~/.claude/
├── config.json              # Global + per-project config
├── settings.json            # Plugin settings
├── settings.local.json      # Permission overrides
├── cron-tasks.json          # Scheduled tasks
├── plugins.json             # Installed plugins
├── skills/                  # Custom skills
├── agents/                  # Custom agents
├── commands/                # Legacy custom commands
└── daemon.log               # Service logs
```

## config.json

Global configuration and per-project settings.

```json
{
  "numStartups": 42,
  "theme": "dark",
  "verbose": false,
  "model": "claude-sonnet-4-5-20250929",
  "preferredNotifChannel": "iterm2",
  "hasCompletedOnboarding": true,
  "projects": {
    "/path/to/project": {
      "allowedTools": ["Bash(git:*)"],
      "enableArchitectTool": false,
      "mcpServers": {}
    }
  }
}
```

### Global Settings

| Key | Type | Description |
|-----|------|-------------|
| `theme` | `"dark"` \| `"light"` | Terminal theme |
| `verbose` | boolean | Enable verbose logging |
| `model` | string | Default model (set via `/model`) |
| `preferredNotifChannel` | string | Notification method: `iterm2`, `terminal_bell`, `iterm2_with_bell`, `notifications_disabled` |

### Per-Project Settings

| Key | Type | Description |
|-----|------|-------------|
| `allowedTools` | string[] | Pre-approved tool patterns (e.g., `Bash(git:*)`) |
| `enableArchitectTool` | boolean | Enable the Architect tool |
| `simpleMode` | boolean | Disable advanced features |
| `dontCrawlDirectory` | boolean | Skip directory crawling for context |
| `mcpServers` | object | Project-specific MCP servers |

Use `/config` to edit these settings interactively.

## settings.local.json

Permission overrides for tool access.

```json
{
  "permissions": {
    "allow": [
      "Bash(grep:*)",
      "WebFetch(domain:docs.anthropic.com)",
      "WebSearch"
    ]
  }
}
```

## cron-tasks.json

Scheduled automation tasks created via CronTool or `/loop`.

```json
[
  {
    "id": "abc123",
    "cron": "0 */6 * * *",
    "prompt": "/market-top-detector",
    "recurring": true,
    "nextFireAt": 1700000000000
  }
]
```

## CLAUDE.md

Project-level instructions for QuantWise. Place in your project root. Created via `/init`.

```markdown
# CLAUDE.md

## Build Commands
- `npm run dev` — Start dev server
- `npm test` — Run tests

## Code Style
- Use TypeScript strict mode
- Prefer functional components
```

QuantWise reads this file automatically to understand your project's conventions.
