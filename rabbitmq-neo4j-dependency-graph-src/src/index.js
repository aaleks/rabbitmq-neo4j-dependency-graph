const fs = require('fs');
const request = require('request');

/** load configurations **/
const CONFIGS = require('./config.json');
const neo4jUrl = 'http://' + CONFIGS.hostNeo4j + ':' + CONFIGS.portNeo4j + '/db/data/transaction/commit';
const json = JSON.parse(fs.readFileSync(CONFIGS.rabbitBaseJSON, CONFIGS.cypherEncoding));

/** logFunction **/
const logFunction = (...messages) => {
    if(CONFIGS.debug){
        console.log(...messages);
    }
};

/** can be optimized with bluebird using promises **/
function cypher(query, params, cb) {
    request.post(
        {
            uri: neo4jUrl,
            headers: {
                Authorization: CONFIGS.basicAuthNeo4j
            },
            json: {statements: [{statement: query, parameters: params}]}
        },
        (err, res) => {
            cb(err, res.body);
        }
    );
}

/** clear the neo4j database **/
cypher("MATCH (n) DETACH DELETE n", {}, (err, result) => {
    logFunction(err, JSON.stringify(result));
});

/** remove the arguemnts **/
/** TODO: need to rename the keys to : arguments.* **/
json["queues"].forEach((item) => {
    delete item.arguments;
});

json["exchanges"].forEach((itemEx) => {
    delete itemEx.arguments;
});

/** remove amqp:// part in src-uri to ease the check when using cypher **/
json["parameters"].forEach((itemPar) => {

    if (itemPar["value"]["src-uri"] == CONFIGS.amqpSeparator) {
        itemPar["value"]["src-uri"] = "/"
    } else {
        itemPar["value"]["src-uri"] = itemPar["value"]["src-uri"].split(CONFIGS.amqpSeparator)[1];
    }

    if (itemPar["value"]["dest-uri"] == CONFIGS.amqpSeparator) {
        itemPar["value"]["dest-uri"] = "/"
    } else {
        itemPar["value"]["dest-uri"] = itemPar["value"]["dest-uri"].split(CONFIGS.amqpSeparator)[1];
    }

    itemPar["value"]["src"] = (itemPar["value"]["src-queue"]!= undefined)?itemPar["value"]["src-queue"]:itemPar["value"]["src-exchange"]
    itemPar["value"]["dest"] = (itemPar["value"]["dest-queue"]!= undefined)?itemPar["value"]["dest-queue"]:itemPar["value"]["dest-exchange"]

});

/** call the cypher and apply changes to neo4J database **/
cypher(fs.readFileSync(CONFIGS.cypherFolder + CONFIGS.cypherQueues, CONFIGS.cypherEncoding), {json}, (err, result) => {
    logFunction(err, JSON.stringify(result));
    cypher(fs.readFileSync(CONFIGS.cypherFolder + CONFIGS.cypherExchanges, CONFIGS.cypherEncoding), {json}, (err, result) => {
        logFunction(err, JSON.stringify(result));
        cypher(fs.readFileSync(CONFIGS.cypherFolder + CONFIGS.cypherBindings, CONFIGS.cypherEncoding), {json}, (err, result) => {
            logFunction(err, JSON.stringify(result));
            cypher(fs.readFileSync(CONFIGS.cypherFolder + CONFIGS.cypherShovel, CONFIGS.cypherEncoding), {json}, (err, result) => {
                logFunction(err, JSON.stringify(result));
            });
        });
    });
});