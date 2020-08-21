#!/bin/bash

docker build -t faysalahmad/idreesia-mongo-express .
docker login --username faysalahmad
docker push faysalahmad/idreesia-mongo-express