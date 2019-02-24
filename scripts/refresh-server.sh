#!/bin/bash

# stop the apps and go to the root folder
pm2 stop ecosystem.config.js
cd ../

# checkout the master branch
# git checkout master
# git pull

# build the idreesia-erp application
cd ./idreesia-erp
meteor yarn install
meteor yarn build
cd ../

# build the idreesia-jobs application
cd ./idreesia-jobs
meteor yarn install
meteor yarn build
cd ../

# go to the built idreesia-erp application and install the dependencies
cd ./build/idreesia-erp/bundle/programs/server
npm install
cd ../../../../..

# go to the built idreesia-jobs application and install the dependencies
cd ./build/idreesia-jobs/bundle/programs/server
npm install
cd ../../../../..

# go to the scripts folder and launch the apps
cd ./scripts
pm2 start ecosystem.config.js
