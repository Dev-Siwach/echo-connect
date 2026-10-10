#!/usr/bin/env bash

# Smoke test for EcoConnect API Gateway endpoints
# Usage: API_URL="https://xxx.execute-api.ap-south-1.amazonaws.com" ./scripts/smoke.sh

set -euo pipefail

if [ -z "${API_URL:-}" ]; then
  echo "Error: API_URL environment variable is required."
  echo "Example: API_URL=https://xxxx.execute-api.ap-south-1.amazonaws.com ./scripts/smoke.sh"
  exit 1
fi

API_URL="${API_URL%/}" # Strip trailing slash

echo "=========================================================="
echo "EcoConnect Smoke Test Suite"
echo "Target API: $API_URL"
echo "=========================================================="

# 1. Test /health
echo -n "[1/3] Testing GET /health ... "
HEALTH_RES=$(curl -sS -w "\n%{http_code}" "$API_URL/health")
HEALTH_CODE=$(echo "$HEALTH_RES" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RES" | head -n -1)

if [ "$HEALTH_CODE" -eq 200 ] && echo "$HEALTH_BODY" | grep -q '"ok":true'; then
  echo "PASS (HTTP 200)"
else
  echo "FAIL (HTTP $HEALTH_CODE)"
  echo "Response: $HEALTH_BODY"
  exit 1
fi

# 2. Test /providers
echo -n "[2/3] Testing GET /providers?itemType=battery_household ... "
PROVIDERS_RES=$(curl -sS -w "\n%{http_code}" "$API_URL/providers?itemType=battery_household")
PROVIDERS_CODE=$(echo "$PROVIDERS_RES" | tail -n1)
PROVIDERS_BODY=$(echo "$PROVIDERS_RES" | head -n -1)

if [ "$PROVIDERS_CODE" -eq 200 ] && echo "$PROVIDERS_BODY" | grep -q '"providers"'; then
  echo "PASS (HTTP 200)"
else
  echo "FAIL (HTTP $PROVIDERS_CODE)"
  echo "Response: $PROVIDERS_BODY"
  exit 1
fi

# 3. Test /search
echo -n "[3/3] Testing POST /search ... "
SEARCH_PAYLOAD='{"query":"purana phone aur charger"}'
SEARCH_RES=$(curl -sS -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "$SEARCH_PAYLOAD" \
  "$API_URL/search")
SEARCH_CODE=$(echo "$SEARCH_RES" | tail -n1)
SEARCH_BODY=$(echo "$SEARCH_RES" | head -n -1)

if [ "$SEARCH_CODE" -eq 200 ] && echo "$SEARCH_BODY" | grep -q '"interpretation"'; then
  echo "PASS (HTTP 200)"
else
  echo "FAIL (HTTP $SEARCH_CODE)"
  echo "Response: $SEARCH_BODY"
  exit 1
fi

echo "=========================================================="
echo "All smoke tests PASSED successfully!"
echo "=========================================================="
