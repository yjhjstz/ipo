# Quick Start

## 1. Set Your API Key

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Or login with your Anthropic account:

```bash
quantwise
# Then run: /login
```

## 2. Start an Interactive Session

```bash
quantwise
```

You'll see an interactive prompt. Type natural language requests:

```
> explain this project's architecture
> find all TODO comments in the codebase
> fix the failing test in auth.test.ts
```

## 3. One-Shot Mode

Run a single command without entering interactive mode:

```bash
quantwise -p "explain this project's architecture"
```

## 4. Pipe Input

```bash
git diff | quantwise -p "review this diff"
cat error.log | quantwise -p "diagnose this error"
```

## 5. Use Trading Skills

Type `/` in the interactive session to see all available skills:

```
/stock AAPL                    # Stock quote and analysis
/chart TSLA                    # Terminal candlestick chart
/canslim-screener              # CANSLIM growth stock screening
/market-top-detector           # Market top probability
/weekly-trade-strategy         # Generate weekly strategy report
/portfolio-manager             # Portfolio analysis and rebalancing
```

## 6. Initialize Project Context

Run `/init` in your project directory to create a `CLAUDE.md` file. This teaches QuantWise about your codebase:

```
/init
```

QuantWise will analyze your project and generate documentation about build commands, code style, testing, and architecture.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Send message |
| `Shift+Enter` | New line (requires `/terminal-setup`) |
| `Ctrl+D` | Exit |
| `Arrow Up/Down` | Navigate command history |
| `Esc` | Cancel dictation (`/listen`) |
