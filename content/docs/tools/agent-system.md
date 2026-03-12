# Agent System

QuantWise can spawn autonomous sub-agents to handle complex, multi-step tasks in parallel.

## Built-in Agents

| Agent | Model | Tools | Purpose |
|-------|-------|-------|---------|
| **Explore** | Haiku (fast) | Glob, Grep, Read, WebFetch, WebSearch | Quick codebase exploration |
| **Plan** | Inherit | Glob, Grep, Read, WebFetch, WebSearch | Architecture design and planning |
| **general-purpose** | Inherit | All tools | Complex autonomous tasks |
| **Bash** | Inherit | Bash only | Command execution specialist |

## Custom Agents

Create custom agents in `.claude/agents/` (project) or `~/.claude/agents/` (global).

### Agent File Format

Create a markdown file with YAML frontmatter:

```markdown
---
name: my-reviewer
description: Code review specialist
tools: Read, Grep, Glob
model: sonnet
permissionMode: default
maxTurns: 10
---

You are a code review specialist. Analyze code for:
- Security vulnerabilities
- Performance issues
- Code style violations
```

### Frontmatter Options

| Key | Values | Description |
|-----|--------|-------------|
| `name` | string | Agent display name |
| `description` | string | Agent purpose |
| `tools` | comma-separated | Allowed tools |
| `disallowedTools` | comma-separated | Tools to exclude |
| `model` | `sonnet`, `opus`, `haiku`, `inherit` | Model to use |
| `permissionMode` | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` | Permission level |
| `maxTurns` | number | Maximum agentic turns |

## Using Agents

### Via Command

```
/agents          # List available agents
```

### Via Natural Language

Ask QuantWise to delegate tasks:

```
> Use the Explore agent to find all database query files
> Spawn a Plan agent to design the authentication refactor
```

## Agent Discovery Priority

1. CLI-provided agents
2. Project agents: `.claude/agents/<name>.md`
3. User agents: `~/.claude/agents/<name>.md`
4. Built-in agents
