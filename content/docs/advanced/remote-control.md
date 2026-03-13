# Remote Control

The `/remote-control` command starts an HTTP server with a built-in web UI, letting you interact with your QuantWise session from a phone, tablet, or any device with a browser.

By default it's accessible on your local network. Set `TUNNEL_URL` to expose it to the internet via Cloudflare Tunnel.

## Quick Start

```
/remote-control
```

QuantWise will:
1. Start an HTTP server on port `3001` (all interfaces)
2. If `TUNNEL_URL` is set, launch `cloudflared` to create a public tunnel
3. Display access URLs

```
HTTP server started on port 3001
Local:  http://192.168.1.100:3001
Stop with: /remote-control stop
```

Open the URL on any device to access the web UI. If `REMOTE_TOKEN` is set, append it to the URL:

```
http://192.168.1.100:3001/?token=mysecret
```

## Syntax

```
/remote-control [port]
/remote-control stop
```

| Command | Description |
|---------|-------------|
| `/remote-control` | Start on default port `3001` |
| `/remote-control 8080` | Start on custom port |
| `/remote-control stop` | Stop the server and tunnel |

## Access Modes

### LAN Access (Default)

The HTTP server binds to `0.0.0.0`, so any device on the same network can connect directly.

```
Your Phone (same Wi-Fi)
    ↕ HTTP
QuantWise HTTP Server (0.0.0.0:3001)
    ↕
QuantWise CLI Session
```

No additional software needed.

### Internet Access (via Cloudflare Tunnel)

To access QuantWise from outside your local network:

1. Install `cloudflared`
2. Create a tunnel config at `~/.cloudflared/config.yml`
3. Set `TUNNEL_URL` environment variable

When `TUNNEL_URL` is set, `/remote-control` automatically spawns `cloudflared` and waits for the tunnel to register:

```
HTTP server started on port 3001
Local:  http://192.168.1.100:3001
Public: https://your-tunnel.example.com
Stop with: /remote-control stop
```

#### Cloudflare Tunnel Setup

**1. Install cloudflared:**

```bash
# macOS
brew install cloudflared

# Debian/Ubuntu
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

**2. Create tunnel config** at `~/.cloudflared/config.yml`:

```yaml
tunnel: your-tunnel-id
credentials-file: /Users/you/.cloudflared/your-tunnel-id.json

ingress:
  - hostname: your-tunnel.example.com
    service: http://localhost:3001
  - service: http_status:404
```

**3. Set environment variables:**

```bash
export TUNNEL_URL="https://your-tunnel.example.com"
export REMOTE_TOKEN="your-secret-token"   # Strongly recommended
```

## Authentication (REMOTE_TOKEN)

When `REMOTE_TOKEN` is set, all API requests (except the initial HTML page load at `/`) require authentication. This means you **must include the token in the URL** when opening the web UI in a browser or on your phone.

### Accessing from Browser / Phone

Append `?token=<your-token>` to the URL:

```
http://10.0.0.243:3001/?token=mysecret
```

The web UI reads the token from the URL on first load and stores it in `sessionStorage`. After that, all subsequent API calls (message fetch, chat submit, SSE stream) are automatically authenticated — you don't need to pass the token again until you close the tab.

### How It Works

The server checks authentication on all endpoints except `GET /` (the HTML page itself):

- **URL query parameter**: `?token=<REMOTE_TOKEN>` — used by the browser and SSE connections
- **Bearer header**: `Authorization: Bearer <REMOTE_TOKEN>` — used by API clients

If `REMOTE_TOKEN` is **not** set and a tunnel is active, QuantWise will warn:

```
⚠ WARNING: No REMOTE_TOKEN set — public URL is open to anyone.
  Set REMOTE_TOKEN=<secret> before starting to require authentication.
```

### Example

```bash
export REMOTE_TOKEN="mysecret"
```

```
/remote-control
```

Then open on your phone:

```
http://192.168.1.100:3001/?token=mysecret
```

## Web UI Features

The built-in web interface includes:

- **Real-time streaming** — see responses as they're generated
- **Server-Sent Events (SSE)** — live message sync across multiple clients
- **Permission requests** — approve or reject tool access from the browser
- **Thinking blocks** — expandable/collapsible AI reasoning display
- **Tool use indicators** — see which tools are being invoked
- **Mobile-optimized** — responsive design for phone access

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | No | Web UI (HTML page) |
| `/messages` | GET | Yes | Fetch message history (JSON) |
| `/messages/live` | GET | Yes | SSE stream for live updates |
| `/chat/stream` | POST | Yes | Submit a prompt, get streaming response |
| `/permission/respond` | POST | Yes | Approve or reject tool permissions |
| `/health` | GET | Yes | Health check |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TUNNEL_URL` | No | Public tunnel URL. When set, `cloudflared` is launched automatically. |
| `REMOTE_TOKEN` | No | Secret token for API authentication. Strongly recommended when using a tunnel. |

## Use Cases

### Mobile Trading Terminal

```
/remote-control
```

Open the local URL on your phone and run commands:

```
/stock AAPL
/canslim-screener
/portfolio-manager
```

### Remote Monitoring with Tunnel

```bash
export TUNNEL_URL="https://my-quantwise.example.com"
export REMOTE_TOKEN="my-secret-123"
```

```
/loop 1h /market-top-detector
/remote-control
```

Access from anywhere via the tunnel URL.

### Shared Analysis Session

Share the URL (and token) with a colleague. Multiple clients can connect simultaneously — all see the same session via SSE live sync.

## Combining with Telegram

Use both remote control and Telegram for full coverage:

```
/remote-control
/telegram start
/loop 1h /market-top-detector and if score > 60 /telegram send "Market risk alert!"
```

Receive push alerts via Telegram, then dig deeper via the web UI.

## Security

| Feature | Detail |
|---------|--------|
| **LAN Only by Default** | No internet exposure unless `TUNNEL_URL` is configured |
| **Token Auth** | `REMOTE_TOKEN` enforces Bearer authentication on all API endpoints |
| **Session Token Storage** | Token stored in `sessionStorage` (cleared on tab close) |
| **SSE Keepalive** | 30-second heartbeat keeps connections alive |
| **CORS Enabled** | All origins allowed — access controlled via `REMOTE_TOKEN` |

### Best Practices

- **Always set `REMOTE_TOKEN`** when using a public tunnel — without it, anyone with the URL has full session access.
- **Use HTTPS tunnels** — plain HTTP is fine on trusted LANs, but always use HTTPS for internet access.
- **Stop when done** — run `/remote-control stop` or close QuantWise to terminate.
- **Rotate tokens** — change `REMOTE_TOKEN` periodically for long-running setups.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Specify a different port: `/remote-control 8080` |
| Can't connect from phone | Ensure both devices are on the same Wi-Fi network |
| `cloudflared: command not found` | Install cloudflared (see setup above) |
| Tunnel not registering | Check `~/.cloudflared/config.yml` and credentials file |
| 401 Unauthorized | Pass token via `?token=...` or `Authorization: Bearer ...` header |
| SSE disconnects | Normal — the client auto-reconnects. Check network stability. |
| `⚠ No REMOTE_TOKEN set` | Set `export REMOTE_TOKEN="..."` before starting |
