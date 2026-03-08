#!/usr/bin/env bash
# PostToolUse hook (Edit|Write): warn when GLB/GLTF references appear in modified files
# Iron Frontier uses ZERO GLBs in the game scene -- all geometry is procedural.
# Non-blocking -- outputs warnings only (always exits 0)
set -uo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  exit 0
fi

# Only check TypeScript source files in game/engine/components
case "$FILE" in
  */game/*.ts|*/game/*.tsx|*/engine/*.ts|*/engine/*.tsx|*/components/*.ts|*/components/*.tsx) ;;
  *) exit 0 ;;
esac

# Skip test files, config, asset manifests, and content-gen scripts
case "$FILE" in
  *.test.ts|*.test.tsx|*/config/*|*/content/*|*/scripts/*|*/lookdev/*) exit 0 ;;
esac

WARNINGS=0

# Check for .glb or .gltf file references
GLB_REFS=$(grep -nEi '\.(glb|gltf)' "$FILE" 2>/dev/null | head -5)
if [ -n "$GLB_REFS" ]; then
  echo "[WARN] no-glb-imports: GLB/GLTF file references found in $FILE"
  echo "$GLB_REFS"
  WARNINGS=$((WARNINGS + 1))
fi

# Check for GLTF loader imports
LOADER_REFS=$(grep -nEi '(GLTFLoader|useGLTF|loadGLTF|SceneLoader.*gltf|ImportMeshAsync.*glb)' "$FILE" 2>/dev/null | head -5)
if [ -n "$LOADER_REFS" ]; then
  echo "[WARN] no-glb-imports: GLTF loader references found in $FILE"
  echo "$LOADER_REFS"
  WARNINGS=$((WARNINGS + 1))
fi

if [ "$WARNINGS" -gt 0 ]; then
  echo ""
  echo "Iron Frontier uses ZERO GLBs in the game scene."
  echo "All geometry must be procedural (Three.js/Babylon.js primitives + canvas textures)."
  echo "GLB references are only acceptable in lookdev/, content-gen scripts, and asset pipelines."
  echo ""
  echo "no-glb-imports: $WARNINGS warning(s) -- not blocking."
fi

exit 0
