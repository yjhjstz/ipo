# Browser Relay

QuantWise includes a built-in browser automation server for web scraping, screenshot capture, and interactive web testing.

## Commands

| Command | Description |
|---------|-------------|
| `/browser start` | Start Browser Relay server |
| `/browser stop` | Stop Browser Relay server |
| `/browser status` | Check server status |

## How It Works

Browser Relay runs a local Playwright-based server that QuantWise can use to:

1. **Capture screenshots** of web pages for analysis
2. **Scrape content** from financial data sources
3. **Interact with web apps** for testing or data extraction
4. **Render charts** from web-based charting platforms

## Usage Example

```bash
# Start the browser relay
/browser start

# Now you can ask QuantWise to capture web pages
"Take a screenshot of the S&P 500 chart on TradingView"

# Stop when done
/browser stop
```

## Architecture

```
QuantWise CLI
    ↓ HTTP requests
Browser Relay Server (localhost)
    ↓ Playwright API
Chromium Browser (headless)
    ↓
Web Pages / Charts / Data Sources
```

## Configuration

The browser relay uses default settings that work for most cases:

- **Port**: Auto-assigned (shown on start)
- **Browser**: Chromium (headless mode)
- **Timeout**: 30 seconds per page load

## Use Cases

### Chart Analysis
```
/browser start
"Screenshot the AAPL daily chart from TradingView and analyze the pattern"
```

### Data Extraction
```
/browser start
"Scrape the IPO calendar from nasdaq.com"
```

### Web App Testing
```
/browser start
"Test the login flow on localhost:3000"
```
