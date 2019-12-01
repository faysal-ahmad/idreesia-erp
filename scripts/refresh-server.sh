#!/bin/bash

# Go to the root folder and stop the containers
cd ../
docker-compose stop

# checkout the master branch
git checkout master
git pull

# build the idreesia-web application
cd ./idreesia-web
meteor yarn install
meteor yarn build
cd ../

# build the idreesia-mobile application
# cd ./idreesia-mobile
# meteor yarn install
# meteor yarn build
# cd ../

# build the idreesia-jobs application
cd ./idreesia-jobs
meteor yarn install
meteor yarn build
cd ../

# start the containers
docker-compose up
