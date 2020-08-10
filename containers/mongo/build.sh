#!/bin/bash

docker build -t faysalahmad/idreesia-db .
docker login --username faysalahmad
docker push faysalahmad/idreesia-db