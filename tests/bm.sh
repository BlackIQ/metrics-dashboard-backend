#!/bin/bash

for i in {1..2001}; do curl -X GET http://localhost:7682/api; done