## rabbitmq-neo4j-dependency-graph

rabbitmq-neo4j-dependency-graph populate a neo4j graph database using the rabbitMQ JSON broker definition

It can be used to have an overview of your RabbitMQ broker 
Links between queues - exchanges - bindings - shovels ... 

##### Run 
1 - Run the neo4j database 

./run.sh

2 - Populate neo4j database with the JSON Broker definition in config.json

cd rabbitmq-neo4j-dependency-graph-src/src/ && npm install && npm start

##### Config 
rabbitmq-neo4j-dependency-graph-src/src/config.json (config variables) 

rabbitmq-neo4j-dependency-graph-src/src/jsonfiles (example json files rabbitMQ broker definition used to populate the DB) 

##### TODOs 
TODO: build docker image with maven (fix issue with parent pom)

Create a simple app with express to serve the html page 
https://github.com/jexp/cy2neo can be used also 