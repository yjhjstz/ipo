# Ollama Setup Guide

QuantWise can use locally-hosted models via [Ollama](https://ollama.com), which exposes an Anthropic-compatible `/v1/messages` endpoint. This lets you run open-source models (GLM, Qwen, etc.) without any cloud API costs.

## Requirements

- Ollama **0.14.3 or later** (required for Anthropic-compatible API and models like `glm-4.7-flash`)
- A model pulled and available in Ollama

Check your version:
```bash
ollama --version
```

## Quick Start

### 1. Start Ollama

By default Ollama only listens on `127.0.0.1`. To use it locally that's fine; for remote access see [Remote Access](#remote-access) below.

```bash
ollama serve
```

### 2. Pull a model with tool support

```bash
ollama pull glm-4.7-flash:q4_K_M   # 19 GB, 30B MoE, 198K context
```

Other good options with tool use support:

| Model | Size | Notes |
|-------|------|-------|
| `glm-4.7-flash:q4_K_M` | 19 GB | Best GLM option, fast MoE inference |
| `qwen3:14b-q4_K_M` | 9.3 GB | Fits in 16 GB VRAM |
| `qwen3:32b-q4_K_M` | 20 GB | High accuracy tool calling |

### 3. Configure QuantWise

Create `.env.ollama` in the project root:

```bash
# QuantWise — Ollama (local)
ANTHROPIC_API_KEY_OVERRIDE=
USER_TYPE=SWE_BENCH
ANTHROPIC_AUTH_TOKEN=ollama
ANTHROPIC_BASE_URL=http://127.0.0.1:11434
ANTHROPIC_MODEL=glm-4.7-flash:q4_K_M
API_TIMEOUT_MS=3000000
ANTHROPIC_DEFAULT_OPUS_MODEL=glm-4.7-flash:q4_K_M
ANTHROPIC_DEFAULT_SONNET_MODEL=glm-4.7-flash:q4_K_M
ANTHROPIC_DEFAULT_HAIKU_MODEL=glm-4.7-flash:q4_K_M
```

> **Note:** When `OLLAMA_API_KEY` is not set on the server, Ollama accepts any token value (or none). Once you set `OLLAMA_API_KEY`, the server will validate it against incoming requests.

### 4. Switch profile and start

```bash
./switch-env.sh ollama
pnpm run dev
```

## Remote Access

To connect to Ollama running on another machine, you need to:

1. **Make Ollama listen on all interfaces** (on the remote host):

```bash
# Listen on all IPv4 + IPv6 interfaces
OLLAMA_HOST='[::]' nohup ollama serve > /tmp/ollama.log 2>&1 &
```

To make this permanent via systemd:
```bash
sudo systemctl edit ollama
```
Add:
```ini
[Service]
Environment="OLLAMA_HOST=[::]"
```
Then `sudo systemctl restart ollama`.

2. **Update `ANTHROPIC_BASE_URL`** with the remote host address:

```bash
# IPv4
ANTHROPIC_BASE_URL=http://192.168.1.100:11434

# IPv6 — brackets required
ANTHROPIC_BASE_URL=http://[240e:390:62a:ab20:d88a:ee60:3fed:9ff1]:11434

# Tailscale IPv6 (recommended — stable across networks)
ANTHROPIC_BASE_URL=http://[fd7a:115c:a1e0::1234:5678]:11434
```

3. **Verify connectivity** before starting QuantWise:

```bash
curl 'http://[<ipv6-address>]:11434/api/version'
# Expected: {"version":"0.15.2"}
```

## VRAM / Memory Guide

Ollama automatically offloads layers to system RAM when VRAM is insufficient.

| GPU VRAM | System RAM | Recommended model |
|----------|------------|-------------------|
| 8 GB | any | `qwen3:8b-q4_K_M` (5.2 GB) |
| 16 GB | 16 GB | `qwen3:14b-q4_K_M` (9.3 GB) |
| 16 GB | 64 GB | `glm-4.7-flash:q4_K_M` (19 GB, ~3 GB RAM offload) |
| 24 GB+ | any | `qwen3:32b-q4_K_M` (20 GB) |

`glm-4.7-flash` uses a MoE architecture — only 3B parameters are active per token, making inference significantly faster than a dense 30B model at the same quality.

## Security

Ollama **0.14+** supports `OLLAMA_API_KEY` for built-in authentication. When set, the server rejects requests without a valid key.

### Enable API Key (recommended for remote access)

**On the server**, set `OLLAMA_API_KEY` when starting Ollama:

```bash
OLLAMA_API_KEY=mysecretkey OLLAMA_HOST='[::]' ollama serve
```

Or permanently via systemd:
```bash
sudo systemctl edit ollama
```
```ini
[Service]
Environment="OLLAMA_HOST=[::]"
Environment="OLLAMA_API_KEY=mysecretkey"
```
Then `sudo systemctl restart ollama`.

**In QuantWise**, set the same key as `ANTHROPIC_AUTH_TOKEN` in your `.env.ollama`:

```bash
ANTHROPIC_AUTH_TOKEN=mysecretkey
```

The Anthropic SDK sends this as the `x-api-key` header, which Ollama accepts.

### Without API key (localhost only)

If Ollama binds only to `127.0.0.1` (the default), no authentication is needed — only local processes can reach it. The placeholder value `ollama` is never validated:

```bash
ANTHROPIC_AUTH_TOKEN=ollama   # any value works when no OLLAMA_API_KEY is set
```

### Other options for network access

- **Firewall rules** — restrict port 11434 to trusted IPs only
- **Tailscale** — expose only over your private Tailscale network (recommended over public internet)

## Troubleshooting

### `ollama list` returns EOF

Your shell has `OLLAMA_HOST` set to a bind address (e.g. `[::]`) which is invalid for client connections. Fix:

```bash
unset OLLAMA_HOST
ollama list
# or
OLLAMA_HOST=127.0.0.1:11434 ollama list
```

### `404 page not found` on `/api/anthropic`

Ollama does not have a `/api/anthropic` path. The correct endpoint is `/v1/messages`, which the Anthropic SDK constructs automatically from `ANTHROPIC_BASE_URL`. Do **not** append `/api/anthropic` to the base URL.

### Slow inference

- Check how many layers are offloaded to CPU RAM: `ollama ps`
- Use a smaller quantization (e.g. `q4_K_M` instead of `q8_0`) to fit more in VRAM
- For MoE models like `glm-4.7-flash`, CPU offload is less of a penalty due to sparse activation

### Token limits

If the model reports incorrect context window or max tokens, override them:

```bash
ANTHROPIC_MAX_OUTPUT_TOKENS=8192
ANTHROPIC_CONTEXT_WINDOW=32768
```

## Multi-provider Switching

Use `switch-env.sh` to switch between Anthropic, GLM, and Ollama:

```bash
./switch-env.sh ollama    # local Ollama
./switch-env.sh glm       # 智谱 BigModel cloud
./switch-env.sh synx      # Claude official API
```

The active `.env` is always a merge of the selected profile + `.env.shared` (Telegram, FMP keys, etc.).
