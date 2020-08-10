#!/bin/bash

docker build -t faysalahmad/idreesia-nginx .
docker login --username faysalahmad
docker push faysalahmad/idreesia-nginx