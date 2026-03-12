# Slash Commands

Type `/` in the interactive session to see all available commands. Commands fall into several categories.

## Session Management

| Command | Description |
|---------|-------------|
| `/help` | Show help and available commands |
| `/exit` or `/quit` | Exit QuantWise |
| `/clear` | Clear conversation history and free context |
| `/compact` | Clear history but keep an AI-generated summary |
| `/resume` | Resume a previous conversation |
| `/rename <name>` | Rename the current conversation |
| `/rewind` | Rewind conversation to a previous point |

## Configuration

| Command | Description |
|---------|-------------|
| `/config` | Open interactive config panel |
| `/model` | Select AI model to use |
| `/init` | Initialize CLAUDE.md with codebase documentation |
| `/login` | Sign in with Anthropic account |
| `/logout` | Sign out |
| `/terminal-setup` | Install Shift+Enter keybinding (iTerm2/VSCode) |

## Context & Monitoring

| Command | Description |
|---------|-------------|
| `/ctx-viz` | Visualize context token usage breakdown |
| `/cost` | Show session cost and duration |
| `/doctor` | Check installation health |

## Code Review & Git

| Command | Description |
|---------|-------------|
| `/review [number]` | Review a pull/merge request |
| `/pipeline [run-id]` | Fetch CI/CD pipeline logs |
| `/pr-comments [number]` | Get PR/MR comments |

## Automation

| Command | Description |
|---------|-------------|
| `/loop [interval] <prompt>` | Run a prompt on a recurring interval |
| `/loop list` | List active loop tasks |
| `/loop cancel <id>` | Cancel a loop task |
| `/loop cancel all` | Cancel all loop tasks |

### Loop Interval Formats:
- `5m` — 5 minutes
- `1h` — 1 hour
- `2d` — 2 days

### Loop Examples:
```
/loop 5m /market-top-detector
/loop 1h check build status
/loop check for new issues every 2h
```

## Infrastructure

| Command | Description |
|---------|-------------|
| `/browser start\|stop\|status` | Manage Browser Relay server |
| `/remote-control [port]` | Start HTTP server + Cloudflare tunnel |
| `/telegram start\|stop\|status\|send` | Manage Telegram bot |
| `/listen` | Activate macOS speech recognition |

## System

| Command | Description |
|---------|-------------|
| `/reload` | Reload skills and commands |
| `/mcp` | View and manage MCP servers |
| `/plugin` | Manage plugin marketplace |
| `/agents` | List available agents |
| `/bug` | Submit feedback |

## Plugin Management

```
/plugin install <name>@<marketplace>     Install a plugin
/plugin uninstall <name>                  Remove a plugin
/plugin list                              List installed plugins
/plugin search <query>                    Search marketplace
/plugin update [name]                     Update plugin(s)
/plugin marketplace add <url>             Add marketplace
/plugin marketplace list                  List marketplaces
/plugin marketplace remove <name>         Remove marketplace
```
