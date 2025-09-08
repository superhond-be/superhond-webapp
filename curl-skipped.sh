#!/bin/sh
# Gebruik: ./curl-skipped.sh https://<jouw-render-app>.onrender.com
URL="${1:-http://localhost:3000}"
curl -s -X POST "$URL/webhook"   -H "Content-Type: application/json"   -d @test/test-payload-skipped.json | jq .
