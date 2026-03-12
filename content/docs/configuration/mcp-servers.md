# MCP Server Configuration

Model Context Protocol (MCP) extends QuantWise with external tools. Configure servers in `.mcp.json` at your project root or in `~/.claude/config.json`.

## .mcp.json Format

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "env": { "API_KEY": "your-key" }
    }
  }
}
```

## Transport Types

### STDIO (Most Common)

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/mcp-server"],
      "env": { "NOTION_API_KEY": "secret_..." }
    }
  }
}
```

### HTTP

```json
{
  "mcpServers": {
    "remote-server": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "headers": { "Authorization": "Bearer token" }
    }
  }
}
```

### SSE (Server-Sent Events)

```json
{
  "mcpServers": {
    "sse-server": {
      "type": "sse",
      "url": "https://example.com/sse",
      "headers": { "Authorization": "Bearer token" }
    }
  }
}
```

### OAuth-Enabled

```json
{
  "mcpServers": {
    "oauth-server": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "oauth": true
    }
  }
}
```

## Managing MCP Servers

Use the `/mcp` command to:
- View connected servers and their tools
- Enable/disable servers
- Check connection status

## Popular MCP Servers

| Server | Package | Description |
|--------|---------|-------------|
| Notion | `@notionhq/mcp-server` | Notion workspace access |
| GitHub | `@modelcontextprotocol/server-github` | GitHub API integration |
| Slack | `@modelcontextprotocol/server-slack` | Slack messaging |
| Playwright | `@anthropic/mcp-playwright` | Browser automation |
| Supabase | `@supabase/mcp-server` | Database operations |
| Firebase | `@anthropic/mcp-firebase` | Firebase management |
