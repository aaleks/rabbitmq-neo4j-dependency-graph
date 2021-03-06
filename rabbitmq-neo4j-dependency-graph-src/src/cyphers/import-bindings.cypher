WITH {json} as data
UNWIND data.bindings as b
//MATCH (qq:Queues), (ex:Exchanges)
//WHERE b.source = ex.name AND b.destination = qq.name
//CREATE (ex)-[:BINDING]->(qq)
MATCH (currentEx:Exchanges {name:b.source, vhost:b.vhost})
MATCH (currentQueue:Queues {name:b.destination, vhost:b.vhost})
CREATE (currentEx)-[bd:BINDING]->(currentQueue)
SET bd=b

//MATCH p=()-[r:BINDING {vhost:"test"}]->() RETURN p LIMIT 25