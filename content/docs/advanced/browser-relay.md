# Browser Relay & Chrome Extension

QuantWise Browser Relay connects QuantWise to your Chrome browser via the Chrome DevTools Protocol (CDP), enabling browser automation, screenshot capture, and web interaction — all controlled from natural language commands.

## Architecture

```
QuantWise CLI (BrowserTool)
    ↕ CDP commands / events
Browser Relay Server (ws://127.0.0.1:18792)
    ↕ WebSocket
Chrome Extension (background service worker)
    ↕ chrome.debugger API
Chrome Browser Tab (attached)
```

## Prerequisites

- Google Chrome or Chromium-based browser
- QuantWise with `BROWSER_RELAY_TOKEN` configured
- The QuantWise Browser Relay Chrome extension installed

## Chrome Extension Installation

The extension source is located at `assets/chrome-extension/`.

### Step 1: Open Chrome Extensions Page

Navigate to `chrome://extensions/` in your Chrome browser.

### Step 2: Enable Developer Mode

Toggle **"Developer mode"** switch in the top-right corner.

### Step 3: Load the Extension

1. Click **"Load unpacked"**
2. Select the `assets/chrome-extension/` directory from your QuantWise installation
3. The **QuantWise Browser Relay** extension will appear in your extensions list

### Step 4: Pin the Extension (Recommended)

Click the puzzle icon in Chrome's toolbar, then click the pin icon next to **QuantWise Browser Relay** for quick access.

## Configuration

### Environment Variables

Set these in your `.env` or shell environment:

```bash
BROWSER_RELAY_TOKEN="your-secret-token"    # Required — shared auth token
BROWSER_RELAY_PORT=18792                   # Optional — default: 18792
```

### Chrome Extension Settings

1. Right-click the extension icon → **"Options"** (or click the puzzle icon → QuantWise Browser Relay → three dots → Options)
2. Set **Relay Port**: must match `BROWSER_RELAY_PORT` (default: `18792`)
3. Set **Auth Token**: must match `BROWSER_RELAY_TOKEN` exactly
4. Click **Save**

> **Important**: The token in the extension options must match the `BROWSER_RELAY_TOKEN` environment variable exactly, otherwise authentication will fail.

## Usage

### Step 1: Start the Relay Server

In QuantWise:

```
/browser start
```

### Step 2: Attach to a Browser Tab

1. Navigate to the target webpage in Chrome
2. Click the **QuantWise Browser Relay** extension icon
3. The badge turns **green (ON)** — the debugger is now attached to this tab

### Step 3: Use Browser Commands

Now QuantWise can control the attached tab:

```
"Take a screenshot of this page"
"Click the login button"
"Type 'hello' into the search box"
"Get the page content"
"Navigate to https://finance.yahoo.com"
"Evaluate document.title in the console"
```

### Step 4: Detach / Stop

- **Detach tab**: Click the extension icon again (toggles off)
- **Stop relay**: `/browser stop`
- **Check status**: `/browser status`

## Extension Badge Status

| Badge | Color | Meaning |
|-------|-------|---------|
| **ON** | Green | Debugger attached, WebSocket connected, authenticated |
| **!** | Red | Error — check token, port, or relay server status |
| *(empty)* | Gray | Not attached to any tab |

## BrowserTool Actions

The BrowserTool supports these CDP actions:

| Action | Description |
|--------|-------------|
| `navigate` | Go to a URL |
| `screenshot` | Capture page screenshot |
| `click` | Click an element |
| `type` | Type text into an input |
| `evaluate` | Execute JavaScript in the page |
| `getContent` | Get page HTML/text content |

## Troubleshooting

### Badge shows "!" (Error)

1. **Token mismatch**: Verify the token in extension options matches `BROWSER_RELAY_TOKEN`
2. **Relay not running**: Run `/browser start` in QuantWise first
3. **Port conflict**: Ensure the port matches between extension options and `BROWSER_RELAY_PORT`

### WebSocket disconnects

The extension handles reconnection automatically with exponential backoff (up to 5 attempts). The MV3 service worker uses a keepalive alarm every 25 seconds to prevent Chrome from killing the background worker.

### Tab navigation breaks connection

The extension automatically tracks URL/title changes via `chrome.webNavigation`. If the tab is closed, the extension cleans up and disconnects gracefully.

### Cannot attach debugger

- Chrome DevTools may already be open for that tab — close DevTools first
- Some Chrome internal pages (`chrome://`, `chrome-extension://`) cannot be debugged
- Only one debugger session per tab is allowed

## Technical Details

- **Manifest Version**: 3 (MV3)
- **Permissions**: `debugger`, `tabs`, `activeTab`, `storage`, `alarms`, `webNavigation`
- **Host Permissions**: `http://127.0.0.1/*` (local relay server only)
- **CDP Version**: 1.3
- **Reconnect Strategy**: Exponential backoff, base 200ms, max 5 attempts
- **State Persistence**: `chrome.storage.session` (survives service worker restarts)
- **Config Storage**: `chrome.storage.local` (persists across browser sessions)
