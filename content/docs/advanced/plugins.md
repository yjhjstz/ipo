# Plugin System

QuantWise supports a plugin marketplace for extending functionality with community and official plugins.

## Plugin Commands

```bash
/plugin install <name>@<marketplace>     # Install a plugin
/plugin uninstall <name>                 # Remove a plugin
/plugin list                             # List installed plugins
/plugin search <query>                   # Search marketplace
/plugin update [name]                    # Update plugin(s)
```

## Marketplace Management

```bash
/plugin marketplace add <url>            # Add a marketplace
/plugin marketplace list                 # List marketplaces
/plugin marketplace remove <name>        # Remove a marketplace
```

## Plugin Types

### Skills
Add new slash commands and analysis capabilities:
- Trading strategies
- Data source integrations
- Custom screeners
- Report generators

### Tools
Extend the tool system with new capabilities:
- Additional API integrations
- Custom data processors
- Specialized calculators

### Themes
Customize the terminal appearance:
- Color schemes
- Layout modifications
- Output formatting

## Installing Plugins

```bash
# Search for plugins
/plugin search "options"

# Install from official marketplace
/plugin install options-flow@claude-plugins-official

# Install from custom marketplace
/plugin install my-plugin@my-marketplace
```

## Plugin Structure

A plugin consists of:

```
my-plugin/
├── manifest.json        # Plugin metadata and configuration
├── skills/              # Skill definitions (markdown prompts)
│   └── my-skill.md
├── tools/               # Tool implementations
│   └── my-tool.js
└── README.md            # Documentation
```

### manifest.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My custom plugin",
  "author": "username",
  "skills": ["skills/my-skill.md"],
  "tools": ["tools/my-tool.js"],
  "dependencies": {
    "api_keys": ["MY_API_KEY"]
  }
}
```

## Creating Plugins

1. Create the plugin directory structure
2. Define skills as markdown files with frontmatter
3. Implement tools as JavaScript modules
4. Write a manifest.json with metadata
5. Publish to a marketplace or install locally

## Official Marketplace

The official marketplace (`claude-plugins-official`) includes curated plugins for:
- Financial data providers
- Technical analysis tools
- Portfolio management
- News and sentiment analysis
- Notification integrations
