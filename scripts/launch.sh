#!/bin/bash

cd ../build/bundle/programs/server
npm install
cd ../../../../scripts
pm2 start ecosystem.config.js
