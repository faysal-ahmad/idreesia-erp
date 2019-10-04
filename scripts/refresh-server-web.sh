#!/bin/bash

# stop the apps and go to the root folder
pm2 stop Idreesia-Web
cd ../

# checkout the master branch
git checkout master
git pull

# build the idreesia-web application
cd ./idreesia-web
meteor yarn install
meteor yarn build
cd ../

# go to the built idreesia-web application and install the dependencies
cd ./build/idreesia-web/bundle/programs/server
npm install
cd ../../../../..

# go to the scripts folder and launch the apps
cd ./scripts
pm2 start Idreesia-Web
