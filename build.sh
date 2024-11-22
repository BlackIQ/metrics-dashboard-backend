#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <tag>"
  exit 1
fi

TAG=$1
docker build -t monitoring-api:$TAG .
