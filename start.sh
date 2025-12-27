#!/bin/bash
set -e

# Inject Opencode Config if provided via ENV
if [ -n "$OPENCODE_CONFIG_JSON" ]; then
    echo "Creating Opencode config from environment variable..."
    mkdir -p /root/.opencode
    echo "$OPENCODE_CONFIG_JSON" > /root/.opencode/config.json
    chmod 600 /root/.opencode/config.json
fi

# Execute the main command
exec "$@"
