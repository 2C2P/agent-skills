#!/bin/bash
# 2C2P Payments Plugin Installer for Qoder
# Usage: curl -fsSL https://developer.2c2p.com/plugins/install-qoder.sh | bash

set -e

PLUGIN_URL="https://raw.githubusercontent.com/2C2P/agent-skills/main/2c2p-payments-0.1.0.zip"
PLUGIN_NAME="2c2p-payments"
INSTALL_DIR="${HOME}/.qoder/plugins/${PLUGIN_NAME}"
TMP_DIR="$(mktemp -d)"

echo "Installing ${PLUGIN_NAME} plugin for Qoder..."

command -v curl >/dev/null 2>&1 || { echo "curl is required but not installed. Aborting." >&2; exit 1; }
command -v unzip >/dev/null 2>&1 || { echo "unzip is required but not installed. Aborting." >&2; exit 1; }

# Download
curl -fsSL -o "${TMP_DIR}/${PLUGIN_NAME}.zip" "$PLUGIN_URL"

# Extract
mkdir -p "$INSTALL_DIR"
unzip -qo "${TMP_DIR}/${PLUGIN_NAME}.zip" -d "${TMP_DIR}/extracted"

# Handle both archive shapes: with or without a top-level wrapper folder
EXTRACTED_ROOT="${TMP_DIR}/extracted"
if [ "$(ls -1 "$EXTRACTED_ROOT" | wc -l | tr -d ' ')" = "1" ]; then
  WRAPPER_DIR="$(ls -1 "$EXTRACTED_ROOT" | head -n 1)"
  PLUGIN_SOURCE="${EXTRACTED_ROOT}/${WRAPPER_DIR}"
else
  PLUGIN_SOURCE="$EXTRACTED_ROOT"
fi

# Copy plugin contents (including hidden .qoder-plugin folder)
shopt -s dotglob
cp -R "${PLUGIN_SOURCE}/"* "${INSTALL_DIR}/"
shopt -u dotglob

# Cleanup
rm -rf "$TMP_DIR"

echo "${PLUGIN_NAME} installed to ${INSTALL_DIR}"
echo "Restart Qoder or reload the workspace to activate the skill."
