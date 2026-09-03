#!/bin/sh
# Moul Server Systemd Installer Script
#
# Quick Install (default service name 'moul'):
#   curl -fsSL https://moul.dev/install-with-systemd.sh | sh
#
# Custom service name via environment variable:
#   curl -fsSL https://moul.dev/install-with-systemd.sh | SERVICE_NAME=my-moul sh
#
# Custom service name via positional argument:
#   curl -fsSL https://moul.dev/install-with-systemd.sh | sh -s -- my-moul
#
# Custom version and service name:
#   curl -fsSL https://moul.dev/install-with-systemd.sh | VERSION=v0.1.0 SERVICE_NAME=moul-prod sh

set -e

# Repository configuration
REPO_OWNER="moul-dev"
REPO_NAME="moul-dev"

# Service configuration
SERVICE_NAME="${1:-${SERVICE_NAME:-${MOUL_SERVICE_NAME:-moul}}}"
SERVICE_NAME="${SERVICE_NAME%.service}"
if [ -z "$SERVICE_NAME" ]; then
    SERVICE_NAME="moul"
fi

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

# 1. Check OS (Must be Linux for systemd)
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
case "$OS" in
    linux*) OS="linux" ;;
    *)
        log_error "Unsupported Operating System: $OS. Systemd installation is only supported on Linux."
        exit 1
        ;;
esac

# 2. Check for systemctl
if ! command -v systemctl >/dev/null 2>&1; then
    log_error "systemctl command not found. This script requires a Linux distribution with systemd."
    exit 1
fi

# 3. Elevate privileges if not running as root
if [ "$(id -u)" -ne 0 ]; then
    if command -v sudo >/dev/null 2>&1; then
        log_info "Elevating privileges with sudo..."
        exec sudo -E "$0" "$@"
    else
        log_error "This script requires root privileges to configure systemd services. Please run as root or with sudo."
        exit 1
    fi
fi

# 4. Detect Architecture
ARCH="$(uname -m)"
case "$ARCH" in
    x86_64|amd64)   ARCH="amd64" ;;
    arm64|aarch64)  ARCH="arm64" ;;
    *)
        log_error "Unsupported Architecture: $ARCH. Moul currently supports amd64 and arm64."
        exit 1
        ;;
esac

log_info "Detected Platform: Linux/${ARCH}"

# 5. Determine Version to Install
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

# 6. Installation Directories & Server Binary Download
INSTALL_DIR="${MOUL_INSTALL_DIR:-/usr/local/bin}"
DATA_DIR="${MOUL_DATA_DIR:-/var/lib/moul}"

# Create temporary directory for downloads
TMP_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t 'moul-install')
trap 'rm -rf "$TMP_DIR"' EXIT INT TERM

log_info "Downloading moul server binary for Linux/${ARCH}..."

# Download 'moul' (Server)
MOUL_ASSET="moul_${TAG}_linux_${ARCH}.tar.gz"
MOUL_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${TAG}/${MOUL_ASSET}"

if ! curl -sSL --fail "$MOUL_URL" -o "$TMP_DIR/$MOUL_ASSET"; then
    log_error "Failed to download $MOUL_URL"
    exit 1
fi

tar -xzf "$TMP_DIR/$MOUL_ASSET" -C "$TMP_DIR"

if [ ! -f "$TMP_DIR/moul" ]; then
    log_error "Server binary 'moul' was not found inside downloaded archive $MOUL_ASSET"
    exit 1
fi

# Install Server Binary
mkdir -p "$INSTALL_DIR"
log_info "Installing moul binary into ${INSTALL_DIR}..."

cp "$TMP_DIR/moul" "$INSTALL_DIR/moul"
chmod 0755 "$INSTALL_DIR/moul"
log_success "Installed moul -> ${INSTALL_DIR}/moul"

# 7. Create System User and Group
log_info "Setting up system user and group 'moul'..."
if ! getent group moul >/dev/null 2>&1; then
    groupadd -r moul 2>/dev/null || addgroup -S moul 2>/dev/null || true
fi

if ! id -u moul >/dev/null 2>&1; then
    useradd -r -g moul -d "$DATA_DIR" -s /bin/false moul 2>/dev/null || adduser -S -D -h "$DATA_DIR" -G moul -s /bin/false moul 2>/dev/null || true
    log_success "Created system user 'moul'"
else
    log_info "System user 'moul' already exists"
fi

# 8. Setup Data Directory
log_info "Configuring data directory ${DATA_DIR}..."
mkdir -p "$DATA_DIR"
chown -R moul:moul "$DATA_DIR"
chmod 0755 "$DATA_DIR"

# 9. Secret Generation & Environment Configuration
generate_secret() {
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -hex 32
    elif [ -c /dev/urandom ]; then
        LC_ALL=C tr -dc 'a-zA-Z0-9' </dev/urandom 2>/dev/null | head -c 64
    else
        printf '%s%s' "$(date +%s)" "$$" | sha256sum | cut -d' ' -f1 2>/dev/null || echo "moul-secret-$(date +%s)"
    fi
}

get_env_val() {
    file="$1"
    var="$2"
    if [ -f "$file" ]; then
        grep "^${var}=" "$file" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'"
    fi
}

ENV_FILE="/etc/moul/${SERVICE_NAME}.env"

ADMIN_KEY="${MOUL_ADMIN_KEY:-}"
if [ -z "$ADMIN_KEY" ]; then
    ADMIN_KEY=$(get_env_val "$ENV_FILE" MOUL_ADMIN_KEY)
fi
if [ -z "$ADMIN_KEY" ]; then
    ADMIN_KEY=$(generate_secret)
fi

JWT_SECRET="${MOUL_JWT_SECRET:-}"
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(get_env_val "$ENV_FILE" MOUL_JWT_SECRET)
fi
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(generate_secret)
fi

log_info "Configuring environment file ${ENV_FILE}..."
mkdir -p /etc/moul

cat <<EOF > "$ENV_FILE"
MOUL_ENV=production
MOUL_ADMIN_KEY=${ADMIN_KEY}
MOUL_JWT_SECRET=${JWT_SECRET}
MOUL_DB_PATH=${DATA_DIR}/moul.db
EOF

chown -R root:moul /etc/moul
chmod 0750 /etc/moul
chmod 0640 "$ENV_FILE"
log_success "Saved configuration to ${ENV_FILE}"

# 10. Create Systemd Service File
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
log_info "Creating systemd service ${SERVICE_FILE}..."

cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=Moul Dynamic Database & Engine (${SERVICE_NAME})
After=network.target

[Service]
Type=simple
User=moul
Group=moul
WorkingDirectory=${DATA_DIR}
ExecStart=${INSTALL_DIR}/moul start
Restart=always
RestartSec=5
EnvironmentFile=-${ENV_FILE}
Environment=MOUL_ENV=production
Environment=MOUL_DB_PATH=${DATA_DIR}/moul.db
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

chmod 0644 "$SERVICE_FILE"
log_success "Systemd unit file created"

# 11. Reload, Enable and Start Systemd Service
log_info "Reloading systemd daemon and enabling ${SERVICE_NAME}.service..."
systemctl daemon-reload
systemctl enable "${SERVICE_NAME}.service"
systemctl restart "${SERVICE_NAME}.service"

echo ""
if systemctl is-active --quiet "${SERVICE_NAME}.service"; then
    log_success "Moul server service (${SERVICE_NAME}.service) is active and running!"
else
    log_error "Moul server service (${SERVICE_NAME}.service) failed to start automatically."
    log_info "Run 'sudo systemctl status ${SERVICE_NAME}.service' or 'sudo journalctl -u ${SERVICE_NAME} -f' to inspect errors."
fi

# 12. Output Summary
echo ""
log_success "=================================================="
log_success "  Moul Server Systemd Installation Complete!      "
log_success "=================================================="
echo ""
log_info "Service Summary:"
echo "  - Binary:         ${INSTALL_DIR}/moul"
echo "  - Service Name:   ${SERVICE_NAME}.service"
echo "  - Data Directory: ${DATA_DIR}"
echo "  - Environment:    ${ENV_FILE}"
echo ""
log_info "Server Credentials:"
echo "  - Admin Key:      ${ADMIN_KEY}"
echo "  - JWT Secret:     ${JWT_SECRET}"
echo ""
log_info "Management Commands:"
echo "  - Check status:   sudo systemctl status ${SERVICE_NAME}"
echo "  - View live logs: sudo journalctl -u ${SERVICE_NAME} -f"
echo "  - Restart server: sudo systemctl restart ${SERVICE_NAME}"
echo "  - Stop server:    sudo systemctl stop ${SERVICE_NAME}"
echo ""
