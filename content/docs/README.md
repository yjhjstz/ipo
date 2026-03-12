# QuantWise

An agentic coding & trading intelligence tool that lives in your terminal. Built on Claude, it understands your codebase and provides market analysis — all through natural language commands.

## Install

```bash
npm install -g quantwise
```

Or use the install script (standalone binary):

```bash
curl -fsSL https://quantumio.com.cn/install.sh | bash
```

## Setup

```bash
# Claude API (direct)
export ANTHROPIC_API_KEY=sk-ant-...
quantwise
```

也支持 [GLM (智谱 BigModel)](configuration/glm-setup.md)：

```bash
# GLM via BigModel proxy
export ANTHROPIC_AUTH_TOKEN=your_zhipu_api_key
export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
quantwise
```

## Quick Start

```bash
# Start interactive session
quantwise

# One-shot command
quantwise -p "explain this project's architecture"

# Pipe input
git diff | quantwise -p "review this diff"

# Trading skills
/stock AAPL
/canslim-screener
/weekly-trade-strategy
```

## What Can QuantWise Do?

### Coding Assistant
- Edit files, fix bugs, refactor code across your codebase
- Answer questions about code architecture and logic
- Execute and fix tests, lint, and other commands
- Git operations: merge conflicts, commits, PRs

### Trading & Market Intelligence (30+ built-in skills)
- **Stock Analysis** — real-time quotes, technical analysis, candlestick charts
- **Market Environment** — global market analysis (US, Europe, Asia, FX, Commodities)
- **Market Top/Bottom Detection** — O'Neil distribution days, Follow-Through Day signals
- **CANSLIM Screener** — William O'Neil growth stock methodology
- **VCP Screener** — Minervini Volatility Contraction Patterns
- **Options Strategy** — Black-Scholes pricing, Greeks, P/L simulation
- **Institutional Flow** — 13F filings tracking for smart money signals
- **Portfolio Manager** — holdings analysis, risk metrics, rebalancing
- **Weekly Strategy** — automated trading strategy report generation

### 36+ Built-in Tools
- **Bash** — execute shell commands
- **File operations** — read, write, edit, glob, grep
- **Web** — fetch URLs, search the web
- **Browser** — headless browser control (navigate, click, screenshot)
- **Debugger** — interactive LLDB/GDB debugging
- **Psql** — interactive PostgreSQL sessions
- **Notebook** — read and edit Jupyter notebooks

### Extensions (via MCP)
- Notion, Slack, GitHub, and more via Model Context Protocol
- Custom plugin marketplace

## License

See LICENSE.md for details.
