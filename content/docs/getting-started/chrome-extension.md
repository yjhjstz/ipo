# Chrome Extension (Browser Relay)

QuantWise Browser Relay is a Chrome extension that connects QuantWise to your browser tabs via Chrome DevTools Protocol, enabling AI-powered browser automation.

## Download

Download the latest version from the [Extension page](/chrome-extension) or directly:

- [quantwise-browser-relay-v1.0.2.zip](/quantwise-browser-relay-v1.0.2.zip)

## Installation

### 1. Unzip the File

Extract the downloaded `.zip` to a permanent folder on your computer. Chrome needs this folder to remain available.

### 2. Load in Chrome

1. Open `chrome://extensions` in your browser
2. Enable **Developer mode** (toggle in the top right)
3. Click **"Load unpacked"**
4. Select the extracted extension folder

### 3. Configure

1. Right-click the extension icon → **Options**
2. Set the **Relay Port** (default: `18792`)
3. Paste your **Auth Token** (must match `BROWSER_RELAY_TOKEN` in your `.env`)
4. Click **Save**

### 4. Connect

Click the extension icon on any tab to attach the debugger. The badge turns **green** (ON) when connected.

## Environment Variables

Add these to your QuantWise `.env` file:

```env
BROWSER_RELAY_PORT=18792
BROWSER_RELAY_TOKEN=your-secret-token
```

## How It Works

```
QuantWise CLI  →  WebSocket (127.0.0.1:18792)  →  Browser Relay Extension  →  Chrome Tab
```

1. QuantWise sends commands via WebSocket to the local relay server
2. The extension receives commands and executes them via Chrome DevTools Protocol
3. Results (DOM content, screenshots, etc.) are sent back to QuantWise

## Features

- **Local only** — all communication stays on `127.0.0.1`, no data leaves your machine
- **Token auth** — secure authentication between QuantWise and the extension
- **Auto-reconnect** — exponential backoff ensures stable connections
- **Any website** — works on all browser tabs
- **Chromium compatible** — works with Chrome, Edge, Brave, Arc

## Troubleshooting

### Badge shows red "!"
The extension encountered an error. Check the service worker console at `chrome://extensions` → extension details → "Inspect views: service worker".

### Cannot connect
- Verify QuantWise is running with browser relay enabled
- Check that the port and token match between `.env` and extension options
- Ensure no firewall is blocking `127.0.0.1:18792`

### Debugger detaches unexpectedly
The extension will attempt to auto-reattach (up to 5 times). If it keeps detaching, try reloading the target tab and clicking the extension icon again.
