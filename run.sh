#!/usr/bin/env bash


cd neo4j
docker-compose down -v
docker-compose up -d

#cd ..
#cd code/rabbimq-graph
#npm install
#node index.js
