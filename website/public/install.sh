#!/bin/sh
# Moul Installer Script
# Usage: curl -fsSL https://moul.dev/install.sh | sh

set -e

# Repository configuration
REPO_OWNER="moul-dev"
REPO_NAME="moul-dev"

# Color definitions (if stdout is a terminal)
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    BLUE='\033[0;34m'
    BOLD='\033[1m'
    NC='\033[0m' # No Color
else
    RED=''
    GREEN=''
    BLUE=''
    BOLD=''
    NC=''
fi

log_info() {
    printf "${BLUE}==>${NC} ${BOLD}%s${NC}\n" "$1"
}

log_success() {
    printf "${GREEN}✔${NC} ${BOLD}%s${NC}\n" "$1"
}

log_error() {
    printf "${RED}Error:${NC} %s\n" "$1" >&2
}

# Detect OS
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
case "$OS" in
    darwin*) OS="darwin" ;;
    linux*)  OS="linux" ;;
    *)
        log_error "Unsupported Operating System: $OS. Moul currently supports macOS and Linux."
        exit 1
        ;;
esac

# Detect Architecture
ARCH="$(uname -m)"
case "$ARCH" in
    x86_64|amd64)   ARCH="amd64" ;;
    arm64|aarch64)  ARCH="arm64" ;;
    *)
        log_error "Unsupported Architecture: $ARCH. Moul currently supports amd64 and arm64."
        exit 1
        ;;
esac

log_info "Detected Platform: ${OS}/${ARCH}"

# Determine Version to Install
if [ -n "$VERSION" ]; then
    TAG="$VERSION"
    case "$TAG" in
        v*) ;;
        *)  TAG="v${TAG}" ;;
    esac
else
    log_info "Fetching latest release tag from GitHub..."
    LATEST_JSON=$(curl -sSL -H "Accept: application/vnd.github+json" -H "User-Agent: moul-installer" "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest" 2>/dev/null || true)
    
    TAG=$(echo "$LATEST_JSON" | grep '"tag_name":' | sed -E 's/.*"tag_name":[[:space:]]*"([^"]+)".*/\1/')
    
    if [ -z "$TAG" ]; then
        TAG=$(curl -sSI "https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest" 2>/dev/null | grep -i '^location:' | sed -E 's/.*tag\/(v?[^[:space:]\r\n]+).*/\1/' || true)
    fi

    if [ -z "$TAG" ]; then
        log_error "Could not determine latest release version. Please set VERSION explicitly (e.g., VERSION=v0.1.0)."
        exit 1
    fi
fi

log_info "Target Version: ${TAG}"

# Determine Installation Directory
if [ -n "$MOUL_INSTALL_DIR" ]; then
    INSTALL_DIR="$MOUL_INSTALL_DIR"
else
    INSTALL_DIR="/usr/local/bin"
fi

USE_SUDO=""
CHECK_DIR="$INSTALL_DIR"
if [ ! -d "$CHECK_DIR" ]; then
    CHECK_DIR="$(dirname "$INSTALL_DIR")"
fi

if [ ! -w "$CHECK_DIR" ]; then
    if [ "$INSTALL_DIR" = "/usr/local/bin" ]; then
        if command -v sudo >/dev/null 2>&1 && [ -t 0 ]; then
            USE_SUDO="sudo"
        else
            INSTALL_DIR="$HOME/.moul/bin"
        fi
    else
        log_error "Installation directory '$INSTALL_DIR' (or its parent directory) is not writable."
        exit 1
    fi
fi

# Create temporary directory for downloads
TMP_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t 'moul-install')
trap 'rm -rf "$TMP_DIR"' EXIT INT TERM

log_info "Downloading binaries for ${OS}/${ARCH}..."

# 1. Download & Extract 'moul' (TUI Client)
MOUL_ASSET="moul_${TAG}_${OS}_${ARCH}.tar.gz"
MOUL_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${TAG}/${MOUL_ASSET}"

if ! curl -sSL --fail "$MOUL_URL" -o "$TMP_DIR/$MOUL_ASSET"; then
    log_error "Failed to download $MOUL_URL"
    exit 1
fi

tar -xzf "$TMP_DIR/$MOUL_ASSET" -C "$TMP_DIR"

if [ ! -f "$TMP_DIR/moul" ]; then
    log_error "Binary 'moul' not found inside downloaded archive $MOUL_ASSET"
    exit 1
fi

# 2. Download & Extract 'mould' (Server) if available
MOULD_ASSET="mould_${TAG}_${OS}_${ARCH}.tar.gz"
MOULD_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${TAG}/${MOULD_ASSET}"

HAS_MOULD=false
if curl -sSL --fail "$MOULD_URL" -o "$TMP_DIR/$MOULD_ASSET" 2>/dev/null; then
    tar -xzf "$TMP_DIR/$MOULD_ASSET" -C "$TMP_DIR"
    if [ -f "$TMP_DIR/mould" ]; then
        HAS_MOULD=true
    fi
fi

# Create target directory if it does not exist
if [ "$USE_SUDO" = "sudo" ]; then
    sudo mkdir -p "$INSTALL_DIR"
else
    mkdir -p "$INSTALL_DIR"
fi

# Install 'moul'
log_info "Installing binaries into ${INSTALL_DIR}..."
$USE_SUDO cp "$TMP_DIR/moul" "$INSTALL_DIR/moul"
$USE_SUDO chmod 0755 "$INSTALL_DIR/moul"
log_success "Installed moul -> ${INSTALL_DIR}/moul"

# Install 'moul-tui' (copy of 'moul' binary so both 'moul' and 'moul-tui' commands work)
$USE_SUDO cp "$TMP_DIR/moul" "$INSTALL_DIR/moul-tui"
$USE_SUDO chmod 0755 "$INSTALL_DIR/moul-tui"
log_success "Installed moul-tui -> ${INSTALL_DIR}/moul-tui"

# Install 'mould' if available
if [ "$HAS_MOULD" = "true" ]; then
    $USE_SUDO cp "$TMP_DIR/mould" "$INSTALL_DIR/mould"
    $USE_SUDO chmod 0755 "$INSTALL_DIR/mould"
    log_success "Installed mould -> ${INSTALL_DIR}/mould"
fi

# PATH Check and Instructions
echo ""
log_success "Moul installation complete (${TAG})!"
echo ""

case ":$PATH:" in
    *":$INSTALL_DIR:"*) ;;
    *)
        log_info "Note: $INSTALL_DIR is not currently in your PATH environment variable."
        log_info "Add it to your PATH by adding the following line to your shell configuration (.bashrc, .zshrc, etc.):"
        echo "    export PATH=\"\$PATH:$INSTALL_DIR\""
        echo ""
        ;;
esac

log_info "Run 'moul --help' or 'moul-tui' to get started."
