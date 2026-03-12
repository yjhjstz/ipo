import { NextRequest, NextResponse } from 'next/server'

// GET /api/install.sh — returns the install script
export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request)
  const version = request.nextUrl.searchParams.get('version') || 'latest'

  const script = `#!/bin/bash
set -euo pipefail

# QuantWise Installer
# Usage: curl -fsSL ${baseUrl}/api/install.sh | bash
#    or: curl -fsSL ${baseUrl}/api/install.sh | bash -s -- --version v1.3.5

VERSION="${version}"
INSTALL_DIR="/usr/local/bin"
BINARY_NAME="quantwise"

# Colors
RED='\\033[0;31m'
GREEN='\\033[0;32m'
CYAN='\\033[0;36m'
NC='\\033[0m'

info()  { echo -e "\${CYAN}[info]\${NC}  $*"; }
ok()    { echo -e "\${GREEN}[ok]\${NC}    $*"; }
error() { echo -e "\${RED}[error]\${NC} $*" >&2; }

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --version|-v) VERSION="$2"; shift 2 ;;
    --dir|-d) INSTALL_DIR="$2"; shift 2 ;;
    *) shift ;;
  esac
done

# Detect platform
detect_platform() {
  local os arch

  case "$(uname -s)" in
    Darwin)  os="darwin" ;;
    Linux)   os="linux" ;;
    MINGW*|MSYS*|CYGWIN*) os="windows" ;;
    *) error "Unsupported OS: $(uname -s)"; exit 1 ;;
  esac

  case "$(uname -m)" in
    x86_64|amd64)  arch="x64" ;;
    arm64|aarch64) arch="arm64" ;;
    *) error "Unsupported architecture: $(uname -m)"; exit 1 ;;
  esac

  echo "\${os} \${arch}"
}

main() {
  echo ""
  echo -e "\${CYAN}  QuantWise Installer\${NC}"
  echo -e "  ─────────────────────"
  echo ""

  read -r PLATFORM ARCH <<< "$(detect_platform)"
  info "Platform: \${PLATFORM}/\${ARCH}"
  info "Version:  \${VERSION}"

  # Download
  local download_url="${baseUrl}/api/download?version=\${VERSION}&platform=\${PLATFORM}&arch=\${ARCH}"
  local tmp_file
  tmp_file="$(mktemp)"

  info "Downloading from \${download_url} ..."

  local http_code
  http_code=$(curl -fsSL -w "%{http_code}" -o "\${tmp_file}" "\${download_url}" 2>/dev/null) || true

  if [[ "\${http_code}" != "200" ]]; then
    # Try to read error message
    if [[ -f "\${tmp_file}" ]] && head -1 "\${tmp_file}" | grep -q "error"; then
      error "Download failed: $(cat "\${tmp_file}")"
    else
      error "Download failed (HTTP \${http_code})"
      error "Check available versions at: ${baseUrl}/api/download"
    fi
    rm -f "\${tmp_file}"
    exit 1
  fi

  # Install
  chmod +x "\${tmp_file}"

  if [[ -w "\${INSTALL_DIR}" ]]; then
    mv "\${tmp_file}" "\${INSTALL_DIR}/\${BINARY_NAME}"
  else
    info "Writing to \${INSTALL_DIR} requires sudo"
    sudo mv "\${tmp_file}" "\${INSTALL_DIR}/\${BINARY_NAME}"
  fi

  # Verify
  if command -v "\${BINARY_NAME}" &>/dev/null; then
    ok "Installed \${BINARY_NAME} to \${INSTALL_DIR}/\${BINARY_NAME}"
    echo ""
    echo -e "  Get started:"
    echo -e "    \${GREEN}export ANTHROPIC_API_KEY=sk-ant-...\${NC}"
    echo -e "    \${GREEN}\${BINARY_NAME}\${NC}"
    echo ""
  else
    ok "Installed to \${INSTALL_DIR}/\${BINARY_NAME}"
    echo ""
    echo -e "  Make sure \${INSTALL_DIR} is in your PATH:"
    echo -e "    \${GREEN}export PATH=\${INSTALL_DIR}:\\$PATH\${NC}"
    echo ""
  fi
}

main
`

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}

function getBaseUrl(request: NextRequest): string {
  // Use X-Forwarded headers in production (Vercel)
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
  return `${proto}://${host}`
}
