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
| `/terminal-setup` | Install Shift+Enter keybinding (iTerm2/VSCode) |
| `/onboarding` | Run the onboarding wizard |

## Context & Monitoring

| Command | Description |
|---------|-------------|
| `/ctx-viz` | Visualize context token usage breakdown |
| `/cost` | Show session cost and duration |
| `/status` | Show session status, API config, and model info |
| `/doctor` | Check installation health |

## Code Review & Git

| Command | Description |
|---------|-------------|
| `/review [number]` | Review a pull/merge request |
| `/pipeline [run-id]` | Fetch CI/CD pipeline logs |
| `/pr-comments [number]` | Get PR/MR comments |
| `/release-notes` | Show release notes |

## Automation

| Command | Description |
|---------|-------------|
| `/loop [interval] <prompt>` | Run a prompt on a recurring interval |
| `/loop list` | List active loop tasks |
| `/loop cancel <id>` | Cancel a loop task |
| `/loop cancel all` | Cancel all loop tasks |

### Loop Interval Formats:
- `5m` or `5min` — 5 minutes
- `1h` or `1hrs` — 1 hour
- `2d` — 2 days
- If omitted, defaults to **10 minutes**

### Loop Examples:
```
/loop 5m /market-top-detector
/loop 1h check build status
/loop check for new issues every 2h
/loop check build                    # defaults to 10m
```

## External Agents

| Command | Description |
|---------|-------------|
| `/gemini <prompt>` | Send prompt to Google Gemini CLI via [ACP protocol](/advanced/gemini-acp) |

Gemini 自带 Google Search，适合实时数据查询。Skills 可通过 `model: gemini` frontmatter 路由到 Gemini 执行。

## Infrastructure

| Command | Description |
|---------|-------------|
| `/remote-control [port]` | Start HTTP server for remote access (default port: 3001) |
| `/remote-control stop` | Stop remote control server |
| `/telegram start\|stop\|status\|send` | Manage Telegram bot |
| `/listen` | Activate macOS speech recognition (dictation) |

## System

| Command | Description |
|---------|-------------|
| `/reload` | Reload skills and commands |
| `/mcp` | View and manage MCP servers (connect/disable/explore) |
| `/plugin` | Manage plugin marketplace |
| `/agents` | List available agents (built-in, project, user) |

## Plugin Management

```
/plugin install <name>@<marketplace>     Install a plugin
/plugin uninstall <name>                  Remove a plugin
/plugin list                              List installed plugins
/plugin search <query>                    Search marketplace
/plugin update [name]                     Update plugin(s)
/plugin marketplace add <url> [branch]    Add marketplace
/plugin marketplace update [name]         Update marketplace repo
/plugin marketplace list                  List marketplaces
/plugin marketplace remove <name>         Remove marketplace
```
