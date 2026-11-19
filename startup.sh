#!/bin/sh
# Idempotent preview startup. Bind the app on 0.0.0.0:8080.
if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
  exit 0
fi
cd /workspace
npm run dev > /tmp/storyverse-dev.log 2>&1 &
