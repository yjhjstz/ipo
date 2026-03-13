# Remote Control

The `/remote-control` command starts an HTTP server with a built-in web UI, letting you interact with your QuantWise session from a phone, tablet, or any device with a browser.

The server binds to `0.0.0.0` and supports both IPv4 and IPv6 access.

## Quick Start

```
/remote-control
```

QuantWise will:
1. Start an HTTP server on port `3001` (all interfaces)
2. Display access URLs

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
| `/remote-control stop` | Stop the server |

## Access Modes

### IPv4 (LAN)

Any device on the same network can connect via the local IPv4 address:

```
http://192.168.1.100:3001/?token=mysecret
```

### IPv6

If your network supports IPv6, you can connect using the IPv6 address in bracket notation:

```
http://[2001:db8::1]:3001/?token=mysecret
```

This is useful for networks where IPv6 is preferred or when IPv4 NAT is not available. The server listens on all interfaces (`0.0.0.0` / `::`) so both IPv4 and IPv6 work out of the box.

### Architecture

```
Your Phone / Any Browser
    ↕ HTTP (IPv4 or IPv6)
QuantWise HTTP Server (0.0.0.0:3001)
    ↕
QuantWise CLI Session
```

## Authentication (REMOTE_TOKEN)

When `REMOTE_TOKEN` is set, all API requests (except the initial HTML page load at `/`) require authentication. This means you **must include the token in the URL** when opening the web UI in a browser or on your phone.

### Accessing from Browser / Phone

Append `?token=<your-token>` to the URL:

```
# IPv4
http://10.0.0.243:3001/?token=mysecret

# IPv6
http://[2001:db8::1]:3001/?token=mysecret
```

The web UI reads the token from the URL on first load and stores it in `sessionStorage`. After that, all subsequent API calls (message fetch, chat submit, SSE stream) are automatically authenticated — you don't need to pass the token again until you close the tab.

### How It Works

The server checks authentication on all endpoints except `GET /` (the HTML page itself):

- **URL query parameter**: `?token=<REMOTE_TOKEN>` — used by the browser and SSE connections
- **Bearer header**: `Authorization: Bearer <REMOTE_TOKEN>` — used by API clients

If `REMOTE_TOKEN` is **not** set, QuantWise will warn:

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
| `REMOTE_TOKEN` | No | Secret token for API authentication. Strongly recommended. |

## Use Cases

### Mobile Trading Terminal

```
/remote-control
```

Open the URL on your phone and run commands:

```
/stock AAPL
/canslim-screener
/portfolio-manager
```

### Remote Monitoring

```
/loop 1h /market-top-detector
/remote-control
```

Check results from any device on the network.

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
| **LAN Only** | No internet exposure by default |
| **Token Auth** | `REMOTE_TOKEN` enforces Bearer authentication on all API endpoints |
| **Session Token Storage** | Token stored in `sessionStorage` (cleared on tab close) |
| **SSE Keepalive** | 30-second heartbeat keeps connections alive |
| **CORS Enabled** | All origins allowed — access controlled via `REMOTE_TOKEN` |

### Best Practices

- **Always set `REMOTE_TOKEN`** — without it, anyone on the network can access your session.
- **Stop when done** — run `/remote-control stop` or close QuantWise to terminate.
- **Rotate tokens** — change `REMOTE_TOKEN` periodically for long-running setups.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Specify a different port: `/remote-control 8080` |
| Can't connect from phone | Ensure both devices are on the same network |
| IPv6 not working | Verify IPv6 is enabled on your network; use bracket notation `http://[addr]:port` |
| 401 Unauthorized | Pass token via `?token=...` or `Authorization: Bearer ...` header |
| SSE disconnects | Normal — the client auto-reconnects. Check network stability. |
| `⚠ No REMOTE_TOKEN set` | Set `export REMOTE_TOKEN="..."` before starting |
