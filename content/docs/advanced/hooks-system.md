# Hooks System

Hooks let you run custom shell commands automatically in response to QuantWise events. They extend functionality without modifying core code.

## Configuration

Hooks are defined in your settings file at `~/.claude/settings.json`:

```json
{
  "hooks": {
    "on_tool_call": [
      {
        "tool": "Bash",
        "command": "echo 'Command executed: $TOOL_INPUT' >> ~/quantwise-audit.log"
      }
    ],
    "on_session_start": [
      {
        "command": "echo 'Session started at $(date)' >> ~/quantwise-sessions.log"
      }
    ]
  }
}
```

## Hook Events

| Event | Trigger | Use Case |
|-------|---------|----------|
| `on_session_start` | New conversation begins | Setup environment, log sessions |
| `on_session_end` | Conversation ends | Cleanup, save state |
| `on_tool_call` | Before a tool executes | Audit logging, validation |
| `on_tool_result` | After a tool completes | Post-processing, notifications |
| `on_prompt_submit` | User sends a message | Input preprocessing |

## Examples

### Audit Logging
Log all file modifications for compliance:

```json
{
  "hooks": {
    "on_tool_call": [
      {
        "tool": "Edit",
        "command": "echo \"$(date): Modified $FILE_PATH\" >> ~/edit-log.txt"
      }
    ]
  }
}
```

### Auto-Backup Before Edits
```json
{
  "hooks": {
    "on_tool_call": [
      {
        "tool": "Edit",
        "command": "cp \"$FILE_PATH\" \"$FILE_PATH.bak\" 2>/dev/null || true"
      }
    ]
  }
}
```

### Session Notifications
```json
{
  "hooks": {
    "on_session_start": [
      {
        "command": "osascript -e 'display notification \"QuantWise session started\" with title \"QuantWise\"'"
      }
    ]
  }
}
```

## Hook Variables

Hooks receive context through environment variables:

| Variable | Description |
|----------|-------------|
| `$TOOL_NAME` | Name of the tool being called |
| `$TOOL_INPUT` | Input parameters (JSON) |
| `$FILE_PATH` | File path (for file-related tools) |
| `$SESSION_ID` | Current session identifier |

## Error Handling

- If a hook command fails (non-zero exit), QuantWise reports the failure but continues execution
- Hook timeouts default to 10 seconds
- Hooks run synchronously — long-running hooks will delay the main workflow
