# Built-in Tools

QuantWise includes 24 built-in tools that Claude can use to interact with your system.

## File & Directory

### Bash
Execute shell commands with timeout support.
```
Parameters: command (required), timeout (optional, max 600000ms)
```
- Persistent shell state across calls
- Output truncation for large responses
- Validates against dangerous commands

### Read (View)
Read files, images, and PDFs.
```
Parameters: file_path, url (for PDFs), offset, limit
```
- Supports text files, images (auto-resize), and PDFs
- Line number support for partial reads
- Max text size: 0.25MB, max image size: 3.75MB

### Write (Replace)
Create or overwrite files.
```
Parameters: file_path (required), content (required)
```
- Generates structured diffs for review
- Creates parent directories automatically
- Respects line ending conventions

### Edit
String-based find-and-replace in files.
```
Parameters: file_path (required), old_string (required), new_string (required)
```
- Precise string matching (not line-based)
- Shows context diffs for review

### Glob
Fast file pattern matching.
```
Parameters: pattern (required), path (optional)
```
- Returns up to 100 results sorted by modification time
- Example: `**/*.tsx`, `src/**/*.test.ts`

### Grep
Regex search across files (powered by ripgrep).
```
Parameters: pattern (required), path (optional), include (optional glob)
```
- Case-insensitive by default
- Returns up to 100 matching files

### List (LS)
List directory contents.
```
Parameters: path (required)
```

## Web & Network

### WebSearch
Search the web via Tavily API.
```
Parameters: query (required), numResults (1-10), searchDepth ("basic"|"advanced")
```
- Requires `TAVILY_API_KEY`
- Supports domain filtering

### WebFetch
Fetch and analyze web content.
```
Parameters: url (required), prompt (required)
```
- Converts HTML to Markdown
- Max fetch size: 512KB
- Blocks unsafe domains (localhost, private IPs)

### Download
Download files from URLs.
```
Parameters: url (required), file_path (required)
```
- Max size: 100MB
- Blocks executable file extensions

## Code & Development

### Psql
Interactive PostgreSQL sessions.
```
Parameters: action ("connect"|"query"|"disconnect"), host, port, database, user, password, command
```
- Persistent connection across calls
- Output truncation: 50KB max

### Debugger
Interactive LLDB/GDB debugging.
```
Parameters: debugger ("lldb"|"gdb"), action ("launch"|"attach"|"command"|"detach"|"stop")
```
- Auto-detects platform (lldb on macOS, gdb on Linux)
- Persistent debugger session

### BrowserTool
Control a browser via Chrome DevTools Protocol.
```
Parameters: action ("navigate"|"click"|"type"|"screenshot"|"evaluate"|"getContent")
```
- Requires Browser Relay connection (`BROWSER_RELAY_TOKEN`)
- Chrome extension integration

## AI & Agent

### Agent (Spawn Agent)
Spawn autonomous sub-agents for complex tasks.
```
Parameters: prompt (required), subagent_type, model, max_turns, name
```
- Types: Explore, Plan, general-purpose, Bash, or custom
- Model options: sonnet, opus, haiku

### Skill
Invoke custom skills from skill files.
```
Parameters: skill (required), args (optional)
```

### Think
Log reasoning thoughts (extended thinking).
```
Parameters: thought (required)
```

## Notebook

### ReadNotebook
Read Jupyter notebooks (.ipynb).
```
Parameters: notebook_path (required)
```

### EditNotebook
Modify Jupyter notebook cells.

## Automation

### CronTool
Create and manage scheduled tasks.
```
Parameters: action ("create"|"list"|"delete"), cron, prompt, recurring
```
- 5-field cron expressions
- Tracks next/last execution times
