const fs = require('fs');
const request = require('request');

/** load configurations **/
const CONFIGS = require('./config.json');
const neo4jUrl = 'http://' + CONFIGS.hostNeo4j + ':' + CONFIGS.portNeo4j + '/db/data/transaction/commit';
const json = JSON.parse(fs.readFileSync(CONFIGS.rabbitBaseJSON, CONFIGS.cypherEncoding));

/** logFunction **/
const logFunction = (...messages) => {
    if (CONFIGS.debug) {
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
json["queues"].forEach((itemEx) => {
    for (var k in itemEx.arguments) {
        itemEx["arguments." + k] = itemEx.arguments[k];
    }
    delete itemEx.arguments;
});

json["exchanges"].forEach((itemEx) => {
    //delete itemEx.arguments;
    for (var k in itemEx.arguments) {
        itemEx["arguments." + k] = itemEx.arguments[k];
    }
    delete itemEx.arguments;
});

json["bindings"].forEach((itemEx) => {
    for (var k in itemEx.arguments) {
        itemEx["arguments." + k] = itemEx.arguments[k];
    }
    delete itemEx.arguments;
});

var newPermissions = [];
/** add the users dependencies **/
json["permissions"].forEach((itemEx, index, object) => {

    //if application user
    if (!(itemEx["read"] == ".*" || itemEx["write"] == ".*" || itemEx["configure"] == ".*")) {
        itemEx["read"] = itemEx["read"].replace(CONFIGS.regexToRemove, '')
        itemEx["write"] = itemEx["write"].replace(CONFIGS.regexToRemove, '')
        newPermissions.push(itemEx)
    }
});
json["permissions"] = newPermissions;

console.log(JSON.stringify(json["permissions"]))

/** can be done also for shovel
 json["parameters"].forEach((itemEx) => {
    for (var k in itemEx.value){
        itemEx["value."+k]=itemEx.value[k];
    }
    delete itemEx.arguments;
});
 */
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

    //src and dest set to ease the relationship creating in import-shovel.cypher
    itemPar["value"]["src"] = (itemPar["value"]["src-queue"] != undefined) ? itemPar["value"]["src-queue"] : itemPar["value"]["src-exchange"]
    itemPar["value"]["dest"] = (itemPar["value"]["dest-queue"] != undefined) ? itemPar["value"]["dest-queue"] : itemPar["value"]["dest-exchange"]

});


/** call the cypher and apply changes to neo4J database **/
/*** TODO: clean and optimize code with bluebird ***/
cypher(fs.readFileSync(CONFIGS.cypherFolder + CONFIGS.cypherQueues, CONFIGS.cypherEncoding), {json}, (err, result) => {
    logFunction(err, 'Queues:: '+ JSON.stringify(result));
    cypher(fs.readFileSync(CONFIGS.cypherFolder + CONFIGS.cypherExchanges, CONFIGS.cypherEncoding), {json}, (err, result) => {
        logFunction(err, 'Exchanges:: '+JSON.stringify(result));
        cypher(fs.readFileSync(CONFIGS.cypherFolder + CONFIGS.cypherBindings, CONFIGS.cypherEncoding), {json}, (err, result) => {
            logFunction(err, 'Bindings:: '+JSON.stringify(result));
            cypher(fs.readFileSync(CONFIGS.cypherFolder + CONFIGS.cypherShovel, CONFIGS.cypherEncoding), {json}, (err, result) => {
                logFunction(err, 'Shovel:: '+JSON.stringify(result));
                cypher(fs.readFileSync(CONFIGS.cypherFolder + CONFIGS.cypherUsers, CONFIGS.cypherEncoding), {json}, (err, result) => {
                    logFunction(err, 'Users:: '+JSON.stringify(result));
                    //load users
                    //add all applications
                    /*** TODO: clean and optimize code ***/
                    json["permissions"].forEach((itemEx)=> {
                        //remove () in string and create array from string
                        //foreach of this array and call the cypher
                        if (itemEx["write"] != "" || itemEx["write"] != ".*" || itemEx["write"] != "()") {
                            //insert write access
                            var res = itemEx["write"].slice(1, -1);
                            res = res.split("|");
                            res.forEach(function(element) {
                                var currentUser={}
                                currentUser['vhost']=itemEx['vhost'];
                                currentUser['user']=itemEx['user'];
                                currentUser['write']=element;
                                //console.log(JSON.stringify(currentUser))
                                cypher(fs.readFileSync(CONFIGS.cypherFolder + CONFIGS.cypherUsersWrite, CONFIGS.cypherEncoding), {currentUser}, (err, result) => {
                                    logFunction(err,  'Users-rights-write-> ' + currentUser['user'] + '  :: ' +JSON.stringify(result) + " rights: " +element);
                                });
                            });
                        }
                        if (itemEx["read"] != "" || itemEx["read"] != "()" || itemEx["read"] != ".*") {
                            //insert read access
                            var res = itemEx["read"].slice(1, -1);
                            res = res.split("|");
                            res.forEach(function(element) {
                                var currentUser={}
                                currentUser['vhost']=itemEx['vhost'];
                                currentUser['user']=itemEx['user'];
                                currentUser['read']=element;
                                //console.log("READ " + JSON.stringify(currentUser))
                                cypher(fs.readFileSync(CONFIGS.cypherFolder + CONFIGS.cypherUsersRead, CONFIGS.cypherEncoding), {currentUser}, (err, result) => {
                                    logFunction(err,  'Users-rights-read-> ' + currentUser['user'] + '  :: ' +JSON.stringify(result) + " rights: " +element);
                                });
                            });
                        }
                    })
                });
            });
        });
    });
});

/*
show user dependencies
MATCH p=(:Users {user:"testVhost",vhost:"test"} )-[r]->() RETURN p LIMIT 25

show what's connected to one queue/exchange (users/bindings)
MATCH p=(dep {name:"secondtest"})-[r]-() RETURN p

show all rabbbit related info
MATCH (qq:Queues), (ex:Exchanges), (us:Users) RETURN qq,ex,us
  */