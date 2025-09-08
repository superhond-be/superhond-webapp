#!/bin/bash
# Simple test script for Superhond Forwarder

BASE_URL="https://superhond-forwarder.onrender.com"
SECRET="een_zelfgekozen_geheim"

echo "=== Test 1: Toegelaten payload (moet forwarded worden) ==="
curl -s -X POST "$BASE_URL/hook"   -H "Content-Type: application/json"   -H "X-Source: mailblue"   -H "X-Topic: Puppy"   -H "X-Shared-Secret: $SECRET"   -d '{"email":"pietje@example.com","name":"Pietje Hond"}' | jq .
echo -e "\n"

echo "=== Test 2: Geblokkeerde payload (topic niet toegestaan) ==="
curl -s -X POST "$BASE_URL/hook"   -H "Content-Type: application/json"   -H "X-Source: mailblue"   -H "X-Topic: Katten"   -H "X-Shared-Secret: $SECRET"   -d '{"email":"katje@example.com","name":"Katje"}' | jq .
echo -e "\n"

echo "=== Test 3: Fout shared secret ==="
curl -s -X POST "$BASE_URL/hook"   -H "Content-Type: application/json"   -H "X-Source: mailblue"   -H "X-Topic: Puppy"   -H "X-Shared-Secret: fout_geheim"   -d '{"email":"jan@example.com","name":"Jan"}' | jq .
echo -e "\n"

echo "=== Health check ==="
curl -s "$BASE_URL/health" | jq .
