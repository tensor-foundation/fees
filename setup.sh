#!/usr/bin/env bash

# This script renames the default project name, description and
# public key with the provided values. Simply update the values
# below, run "./init.sh" in your terminal and you're good to go!

# This will be used as the program name and will have a "program" suffix automatically added.
# Use lowercase letters and hyphens or underscores.
export NAME="project-name"
# This is used as the Github and NPM organization names in the package.json file.
export ORGANIZATION="organization"
export AUTHOR="author <author@email.com>"
export DESCRIPTION="My project description"
export PUBLIC_KEY="MyProgram1111111111111111111111111111111111"

# ------------------------------------
# --- Do not edit below this line. ---
# ------------------------------------

ROOT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

source $ROOT_DIR/scripts/init.sh $ROOT_DIR

echo "You're all set, build something cool and ship it! 🚢"
echo "This script will now self-destruct."

# Self-destruct
rm "$ROOT_DIR/scripts/init.sh"
rm "$ROOT_DIR/setup.sh"
