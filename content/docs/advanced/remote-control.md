# Remote Control

The `/remote-control` command starts an HTTP server that lets you interact with your QuantWise session from a phone, tablet, or any device with a web browser on the same network.

Optionally, set the `TUNNEL_URL` environment variable to expose your session to the internet via a tunnel service.

## Quick Start

```
/remote-control
```

QuantWise will:
1. Start a local HTTP server (default port: `3100`)
2. Display the local access URL

```
Remote Control started!
  Local:  http://192.168.1.100:3100
  Auth:   your-generated-token
```

Open the URL on any device in your local network to access your session.

## Syntax

```
/remote-control [port]
```

| Argument | Default | Description |
|----------|---------|-------------|
| `port` | `3100` | Local HTTP server port |

## Access Modes

### LAN Access (Default)

By default, `/remote-control` starts an HTTP server accessible within your local network. Any device on the same Wi-Fi or LAN can connect.

```
Your Phone (same Wi-Fi)
    ↕ HTTP
QuantWise HTTP Server (192.168.x.x:3100)
    ↕
QuantWise CLI Session
```

No additional software or configuration is needed.

### Internet Access (via TUNNEL_URL)

To access QuantWise from outside your local network, configure a tunnel service by setting the `TUNNEL_URL` environment variable. This works with any tunnel provider — Cloudflare Tunnel, ngrok, frp, or similar.

```bash
export TUNNEL_URL="https://your-tunnel-url.example.com"
```

When `TUNNEL_URL` is set, `/remote-control` will display both local and public URLs:

```
Remote Control started!
  Local:  http://192.168.1.100:3100
  Public: https://your-tunnel-url.example.com
  Auth:   your-generated-token
```

#### Tunnel Setup Examples

**Cloudflare Tunnel (free, no account required):**

```bash
# Install cloudflared
brew install cloudflared          # macOS
# or
sudo apt install cloudflared      # Debian/Ubuntu

# Start a quick tunnel
cloudflared tunnel --url http://localhost:3100

# Copy the generated URL and set it
export TUNNEL_URL="https://xxxx-xxxx.trycloudflare.com"
```

**ngrok:**

```bash
ngrok http 3100

# Copy the forwarding URL
export TUNNEL_URL="https://xxxx.ngrok-free.app"
```

**frp (self-hosted):**

Configure your `frpc.toml` to forward port `3100`, then set `TUNNEL_URL` to your frp server's public address.

## Use Cases

### Mobile Trading Terminal

Access your QuantWise trading tools from your phone on the same network:

```
/remote-control
```

Then on your phone, open the local URL and run commands:

```
/stock AAPL
/canslim-screener
/portfolio-manager
```

### Shared Analysis Session

Share the URL with a colleague on the same network for collaborative market analysis.

### Remote Monitoring

Combine with `/loop` to set up background tasks, then check results from any device:

```
/loop 1h /market-top-detector
/remote-control
```

## Security

| Feature | Detail |
|---------|--------|
| **Auth Token** | Random token generated per session, required for all requests |
| **LAN Only by Default** | No internet exposure unless you configure `TUNNEL_URL` |
| **Transport** | Use HTTPS tunnels for internet access to encrypt traffic |

### Best Practices

- **Don't share the URL publicly** — anyone with the URL and token can execute commands in your session.
- **Stop the server when done** — close QuantWise or use `Ctrl+C` to terminate.
- **Use HTTPS tunnels for internet access** — plain HTTP is fine on trusted LANs, but always use an HTTPS tunnel for remote access.
- **Rotate sessions** — each new `/remote-control` invocation generates a fresh auth token.

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

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TUNNEL_URL` | No | Public tunnel URL for internet access. When not set, only LAN access is available. |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Specify a different port: `/remote-control 3200` |
| Can't connect from phone | Ensure both devices are on the same Wi-Fi network |
| Connection refused | Check firewall settings — port `3100` must be open for LAN traffic |
| Tunnel not working | Verify your tunnel service is running and `TUNNEL_URL` is set correctly |
| Session expired | The server stops when QuantWise exits; restart with `/remote-control` |
