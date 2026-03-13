# Remote Control

The `/remote-control` command starts an HTTP server and exposes your QuantWise session to the internet via a Cloudflare tunnel. This lets you interact with QuantWise from a phone, tablet, or any device with a web browser — no VPN or port forwarding needed.

## Quick Start

```
/remote-control
```

QuantWise will:
1. Start a local HTTP server (default port: `3100`)
2. Create a Cloudflare tunnel to generate a public URL
3. Display the URL and access credentials

```
Remote Control started!
  Local:  http://localhost:3100
  Public: https://xxxx-xxxx-xxxx.trycloudflare.com
  Auth:   your-generated-token
```

Open the public URL on any device to access your session.

## Syntax

```
/remote-control [port]
```

| Argument | Default | Description |
|----------|---------|-------------|
| `port` | `3100` | Local HTTP server port |

## Prerequisites

### Cloudflare Tunnel (cloudflared)

The tunnel requires `cloudflared` to be installed on your machine.

**macOS:**

```bash
brew install cloudflared
```

**Linux:**

```bash
# Debian/Ubuntu
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Or download the binary directly
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
```

**Windows:**

```powershell
winget install Cloudflare.cloudflared
```

No Cloudflare account is required — the free "quick tunnel" feature is used automatically.

## How It Works

```
Your Phone / Any Browser
    ↕ HTTPS
Cloudflare Edge Network
    ↕ Encrypted tunnel
cloudflared (local daemon)
    ↕ HTTP
QuantWise HTTP Server (localhost:3100)
    ↕
QuantWise CLI Session
```

1. QuantWise spawns a lightweight HTTP server that accepts text prompts and returns responses.
2. `cloudflared` creates a free tunnel from the Cloudflare edge to your local server.
3. The generated URL (e.g., `https://xxxx.trycloudflare.com`) is publicly accessible.
4. An auth token is generated for each session to prevent unauthorized access.

## Use Cases

### Mobile Trading Terminal

Access your QuantWise trading tools from your phone:

```
/remote-control
```

Then on your phone, open the public URL and run commands:

```
/stock AAPL
/canslim-screener
/portfolio-manager
```

### Shared Analysis Session

Share the URL with a colleague for collaborative market analysis. Both of you see the same session in real time.

### Remote Monitoring

Combine with `/loop` to set up background tasks, then check results remotely:

```
/loop 1h /market-top-detector
/remote-control
```

Monitor market conditions from anywhere via the tunnel URL.

## Security

| Feature | Detail |
|---------|--------|
| **Transport** | HTTPS via Cloudflare — all traffic encrypted end-to-end |
| **Auth Token** | Random token generated per session, required for all requests |
| **Local Only** | The HTTP server binds to localhost — no direct network exposure |
| **Ephemeral URL** | Tunnel URL changes each time, cannot be guessed |
| **No Account Required** | Uses Cloudflare's free quick tunnel — no signup needed |

### Best Practices

- **Don't share the URL publicly** — anyone with the URL and token can execute commands in your session.
- **Stop the tunnel when done** — close QuantWise or use `Ctrl+C` to terminate.
- **Use over trusted networks** — while traffic is encrypted, the session has full access to your machine.
- **Rotate sessions** — each new `/remote-control` invocation generates a fresh URL and token.

## Combining with Telegram

For maximum flexibility, use both remote control and Telegram:

```
# Start remote access
/remote-control

# Also enable Telegram notifications
/telegram start

# Set up monitoring that alerts via Telegram
/loop 1h /market-top-detector and if score > 60 /telegram send "Market risk alert!"
```

This way you receive push notifications via Telegram and can dig deeper via the remote control web interface.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `cloudflared: command not found` | Install cloudflared (see Prerequisites above) |
| Port already in use | Specify a different port: `/remote-control 3200` |
| Tunnel URL not generated | Check your internet connection; cloudflared needs outbound HTTPS access |
| Connection refused on mobile | Ensure you're using the `https://...trycloudflare.com` URL, not `localhost` |
| Slow response | Tunnel adds ~50-100ms latency; this is normal for free tunnels |
| Session expired | Tunnels may timeout after extended inactivity; restart with `/remote-control` |
