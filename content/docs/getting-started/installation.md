# Installation

## NPM (Recommended)

```bash
npm install -g quantwise
```

## Standalone Binary

```bash
curl -fsSL https://quantumio.com.cn/install.sh | bash
```

## From Source

```bash
git clone <repo-url>
cd ccode
pnpm i
pnpm run build        # bundle to cli.mjs
pnpm run build:bin    # standalone binary
```

## System Requirements

- **Node.js** 18 or later
- **macOS**, **Linux**, or **Windows** (WSL recommended)
- An **Anthropic API key** (or OAuth login)

## Verify Installation

```bash
quantwise --version
```
