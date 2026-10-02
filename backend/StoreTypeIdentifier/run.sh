#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
"$SCRIPT_DIR/store_type_identifier_env/bin/python" "$SCRIPT_DIR/StoreTypeIdentifier.py"