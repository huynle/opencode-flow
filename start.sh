#!/bin/bash
set -e

# Inject Opencode Config if provided via ENV
if [ -n "$OPENCODE_AUTH_JSON" ]; then
    echo "Creating Opencode config from environment variable..."
    mkdir -p /root/.config/opencode
    echo "$OPENCODE_AUTH_JSON" > /root/.config/opencode/antigravity-accounts.json
    chmod 600 /root/.config/opencode/antigravity-accounts.json
fi


# Start ttyd in background on port 7681
echo "Starting ttyd on port 7681..."
ttyd -p 7681 -W bash &

# Execute the main command
exec "$@"

