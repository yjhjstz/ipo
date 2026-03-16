# Browser Control & Chrome CDP

QuantWise supports two methods to control Chrome via the Chrome DevTools Protocol (CDP), enabling screenshots, clicks, form input, and JavaScript execution through natural language commands.

## Connection Methods

### Method A: Chrome 144+ Direct Connection (Recommended)

**No extension required.** Chrome 144+ has a built-in remote debugging server that QuantWise can connect to directly.

#### Step 1: Enable Remote Debugging in Chrome

Navigate to `chrome://inspect#remote-debugging` and check **"Allow remote debugging for this browser instance"**.

Chrome will display `Server running at: 127.0.0.1:9222`.

#### Step 2: Configure Environment Variable

Add to your `.env`:

```bash
BROWSER_CDP_ENDPOINT=http://127.0.0.1:9222
```

QuantWise connects automatically on startup.

#### Step 3: Use Browser Commands

```
/browser connect          # Manual connect (skip if env var is set)
/browser status           # Show connection status
/browser tabs             # List all open tabs
/browser switch <id>      # Switch to a specific tab
```

Once connected, control the browser with natural language:

```
"Take a screenshot of this page"
"Navigate to https://finance.yahoo.com"
"Click the search box and type NVDA"
"Get the page content"
"Evaluate document.title"
```

---

## Architecture

```
QuantWise CLI ──WebSocket──> Chrome CDP (127.0.0.1:9222)
                              └─> Any Tab
```

## BrowserTool Actions

| Action | Description | Returns |
|--------|-------------|---------|
| `navigate` | Go to a URL and wait for page load | Page title |
| `screenshot` | Capture screenshot to `/tmp/` | File path (no image tokens consumed) |
| `click` | Click an element by CSS selector | Element info |
| `type` | Type text (optionally focus via selector first) | Confirmation |
| `evaluate` | Execute JavaScript in the page | Return value (truncated to 4000 chars) |
| `getContent` | Get `document.body.innerText` | Page text (truncated to 8000 chars) |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BROWSER_CDP_ENDPOINT` | Direct mode, e.g. `http://127.0.0.1:9222` |

## Token Cost Reference

| Operation | Estimated Tokens |
|-----------|-----------------|
| navigate / click / type | ~30 tokens |
| screenshot (text reply only) | ~50 tokens |
| View screenshot via FileRead | ~1,600 tokens |
| getContent (full page text) | ~2,000 tokens |
| evaluate result | ~200–1,000 tokens |

> **Tip:** Use `evaluate` to extract specific data precisely instead of taking screenshots. Reserve screenshots for cases where you need to visually inspect the page layout.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `/browser connect` fails | Confirm Chrome remote debugging is enabled and shows `127.0.0.1:9222` |
| Cannot attach debugger | Close DevTools for that tab; `chrome://` internal pages cannot be debugged |
| WebSocket disconnects | Recovers on the next command |
