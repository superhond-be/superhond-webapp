#!/bin/bash
# Testscript
BASE_URL=$1
if [ -z "$BASE_URL" ]; then echo "Gebruik: bash test.sh <render-url>"; exit 1; fi
echo "== /health =="; curl -s $BASE_URL/health | jq
echo "== /about =="; curl -s $BASE_URL/about | jq
echo "== /selftest =="; curl -s $BASE_URL/selftest | jq
echo "== /lessons =="; curl -s $BASE_URL/lessons | jq
