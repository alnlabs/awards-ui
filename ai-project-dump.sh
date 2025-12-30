#!/bin/bash

set -e

echo ""
echo "========== PACKAGE.JSON =========="
cat package.json

echo ""
echo "========== PROJECT STRUCTURE =========="
find . \
  -type d \
  ! -path "./node_modules*" \
  ! -path "./.git*" \
  ! -path "./dist*" \
  ! -path "./build*" \
  | sed 's|^\./||'

echo ""
echo "========== PROJECT FILES =========="
find . \
  -type f \
  ! -path "./node_modules/*" \
  ! -path "./.git/*" \
  ! -path "./dist/*" \
  ! -path "./build/*" \
  | sed 's|^\./||'

echo ""
echo "========== END =========="