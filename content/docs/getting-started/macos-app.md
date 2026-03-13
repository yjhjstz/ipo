# macOS App

QuantWise includes a native macOS menubar application — a companion frontend that connects to the CLI's HTTP server and provides voice input, camera capture, text-to-speech, and a persistent chat UI accessible from your menu bar.

## Features

- **Menubar Access** — always one click away, no Dock icon
- **Global Hotkey** — `Cmd+Shift+Q` toggles the app from anywhere
- **Voice Input** — Chinese speech recognition via macOS native APIs
- **Camera Capture** — take a photo and send it to Claude for visual analysis
- **Text-to-Speech** — hear responses read aloud (Chinese + English)
- **Permission Management** — approve or reject tool access from the app
- **Streaming Responses** — real-time thinking blocks, tool use indicators, and streamed text
- **Auto-Discovery** — automatically finds the running CLI server on ports 3001–3005

## Requirements

- macOS 14.0+
- QuantWise CLI running with `/remote-control` active
- Swift 5.9+ (for building from source)

## Build & Run

```bash
cd apps/macos

# Development (debug build + run)
make dev

# Production build
make build
make app
open QuantWise.app
```

### Makefile Targets

| Target | Description |
|--------|-------------|
| `make build` | Release build via Swift Package Manager |
| `make run` | Build and open the .app bundle |
| `make dev` | Debug build + run |
| `make app` | Create a properly structured .app bundle |
| `make clean` | Remove build artifacts |

## How It Works

```
QuantWise macOS App (menubar)
    ↕ REST API + SSE
QuantWise CLI HTTP Server (localhost:3001)
    ↕
Claude AI + MCP Tools + Trading Skills
```

1. Start the CLI and run `/remote-control` to activate the HTTP server.
2. Launch the macOS app — it auto-discovers the server on ports 3001–3005.
3. Chat via text, voice, or camera. Responses stream back in real time.
4. When the CLI requests a tool permission, the app shows a native dialog.

## Configuration

Click the **gear icon** in the app header to open Settings:

| Setting | Default | Description |
|---------|---------|-------------|
| Port | `3001` | CLI server port |
| API Token | `mysecret` | Must match `REMOTE_TOKEN` in CLI |

Settings are persisted in macOS `UserDefaults`.

## Input Methods

### Text
Type in the multiline text field (1–5 lines). Press Enter or click Send.

### Voice (Microphone)
Click the **mic button** to start Chinese speech recognition. Transcription appears in real time. Click again to stop. Requires microphone and speech recognition permissions.

### Camera
Click the **camera button** to capture a photo. Preview appears before sending. Images are compressed (max 1024px, JPEG 80%) and sent as base64 to Claude's vision capabilities.

## Text-to-Speech

Click the **speaker icon** on any assistant message to hear it read aloud.

- **Bilingual**: Auto-detects Chinese vs English based on character density
- **Chinese voices**: Tingting, Lili, Shanshan (in preference order)
- **English voices**: Samantha, Ava, Zoe (in preference order)
- Markdown is stripped for clean audio output
- Sentences are split for natural rhythm

## Permission Requests

When the CLI needs to execute a tool (e.g., file edit, bash command), the app shows a modal dialog with:

- Tool name and description
- Input parameters
- Three options: **Allow**, **Allow Permanent**, **Reject**

A macOS notification is also sent so you don't miss requests when the app is in the background.

## Connection Status

The header dot indicates connection state:

| Color | Status |
|-------|--------|
| Green | Connected and ready |
| Yellow | Connecting or busy |
| Gray | Disconnected |
| Red | Error |

The app reconnects automatically with a 2-second retry interval. Health checks run every 10 seconds.

## Architecture

| Component | Technology |
|-----------|-----------|
| UI Framework | SwiftUI |
| Platform APIs | AppKit (hotkey, notifications) |
| HTTP Client | URLSession |
| Speech Recognition | AVFoundation (Speech framework) |
| Text-to-Speech | AVSpeechSynthesizer |
| Camera | AVCaptureSession |
| Build System | Swift Package Manager |
| Concurrency | Swift async/await + actors |

### App Structure

```
apps/macos/Sources/QuantWise/
├── App/           # Entry point, global hotkey
├── Models/        # ChatMessage, PermissionRequest, SSEEvent
├── Services/      # APIClient, SSEClient, Speech, TTS, Camera, Discovery
├── ViewModels/    # Chat, Connection, Permission state management
├── Views/         # Chat, InputBar, Settings, Permission modal
└── Utilities/     # UserDefaults extensions
```

## macOS Permissions

The app requests these permissions on first use:

| Permission | Purpose |
|------------|---------|
| Microphone | Voice input / speech recognition |
| Speech Recognition | Transcribe voice to text |
| Camera | Photo capture for visual analysis |

All usage descriptions are defined in `Info.plist`.
