# Installation

## NPM (Recommended)

```bash
npm install -g quantwise
```

## Download API

You can also download binaries directly via the API:

```bash
# List available releases
curl https://quantumio.com.cn/api/download

# Download specific platform/version
curl -fsSLO https://quantumio.com.cn/api/download?version=latest&platform=darwin&arch=arm64
curl -fsSLO https://quantumio.com.cn/api/download?version=v1.3.5&platform=linux&arch=x64
```

### Supported Platforms

| Platform | Architecture | Parameter |
|----------|-------------|-----------|
| macOS | Apple Silicon | `platform=darwin&arch=arm64` |
| macOS | Intel | `platform=darwin&arch=x64` |
| Linux | x86_64 | `platform=linux&arch=x64` |
| Windows | x86_64 | `platform=windows&arch=x64` |

## System Requirements

- **macOS**, **Linux**, or **Windows** (WSL recommended)
- **Node.js** 18+ (only for npm install method)
- An **Anthropic API key** (or OAuth login)

## Verify Installation

```bash
quantwise --version
```
