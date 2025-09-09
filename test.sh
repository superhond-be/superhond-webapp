#!/bin/bash
# Superhond Forwarder + Lessen testscript
# Gebruik: bash test.sh <render-url>
# Voorbeeld: bash test.sh https://superhond-forwarder.onrender.com

BASE_URL=$1

if [ -z "$BASE_URL" ]; then
  echo "Gebruik: bash test.sh <render-url>"
  exit 1
fi

echo "== /health =="
curl -s $BASE_URL/health | jq

echo "== /about =="
curl -s $BASE_URL/about | jq

echo "== /selftest =="
curl -s $BASE_URL/selftest | jq

echo "== /lessons (alle lessen) =="
curl -s $BASE_URL/lessons | jq

echo "== /lessons?type=Puppy =="
curl -s "$BASE_URL/lessons?type=Puppy" | jq

echo "== POST /lessons (nieuwe testles) =="
curl -s -X POST $BASE_URL/lessons   -H "Content-Type: application/json"   -d '{"type":"Puppy","theme":"Testles","location":"Retie","date":"2025-10-01","time":"10:30","trainer":"Sofie"}' | jq
