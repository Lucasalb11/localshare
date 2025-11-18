#!/bin/bash

# Script to sync IDL from Anchor build to frontend
# This ensures the frontend always uses the latest program interface

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔄 Syncing IDL from Anchor build to frontend..."

# Check if Anchor project exists
if [ ! -d "$PROJECT_ROOT/anchor_project" ]; then
    echo "❌ Error: anchor_project directory not found at $PROJECT_ROOT/anchor_project"
    exit 1
fi

# Check if target IDL exists
IDL_SOURCE="$PROJECT_ROOT/anchor_project/target/idl/my_program.json"
if [ ! -f "$IDL_SOURCE" ]; then
    echo "❌ Error: Source IDL not found at $IDL_SOURCE"
    echo "   Make sure to build the Anchor program first: cd anchor_project && anchor build"
    exit 1
fi

# Check if frontend IDL directory exists
IDL_DEST_DIR="$PROJECT_ROOT/frontend/app/idl"
if [ ! -d "$IDL_DEST_DIR" ]; then
    echo "❌ Error: Frontend IDL directory not found at $IDL_DEST_DIR"
    exit 1
fi

IDL_DEST="$IDL_DEST_DIR/localshare.json"

# Copy the IDL
cp "$IDL_SOURCE" "$IDL_DEST"

echo "✅ IDL synced successfully!"
echo "   Source: $IDL_SOURCE"
echo "   Destination: $IDL_DEST"

# Verify the copy was successful
if cmp -s "$IDL_SOURCE" "$IDL_DEST"; then
    echo "✅ Files match - sync completed successfully"
else
    echo "❌ Error: Files don't match after copy"
    exit 1
fi
