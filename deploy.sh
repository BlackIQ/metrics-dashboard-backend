#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <tag>"
  exit 1
fi

TAG=$1
docker run --network monitoring-network -p 9999:8000 --name monitoring-api --detach monitoring-api:$TAG
