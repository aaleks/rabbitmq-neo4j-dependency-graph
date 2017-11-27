WITH {json} as data
UNWIND data.queues as q CREATE (queues:Queues) SET queues = q

//WITH {json} as data
//UNWIND data.exchanges as e
//MERGE (exchanges:Exchanges {description:e.name}) ON CREATE
//  SET exchanges.name = e.name, exchanges.vhost = e.vhost


//WITH {json} as data
//  UNWIND data.queues as q CREATE (queues:Queues) SET queues = q
  //MERGE (queues:Queues {description:q.name}) ON CREATE
  //    SET queues.name = q.name, queues.vhost = q.vhost, queues.durable = q.durable, queues.auto_delete = q.auto_delete


  //WITH {json} as data
  //UNWIND data.exchanges as e CREATE (exchanges:Exchanges) SET exchanges = e


//WITH {json} as data
//UNWIND data.bindings as b
//MERGE (bindings:Bindings {description:b.source}) ON CREATE
//  SET bindings.source = b.source, bindings.destination = b.destination, bindings.destination_type = b.destination_type, bindings.routing_key=b.routing_key
//MATCH (currentEx:Exchanges {name:b.source})
//MATCH (currentQueue:Queues {name:b.destination})
//CREATE (currentEx)-[:BINDING {name: b.source + b.destination}]->(currentQueue)

//MATCH (qq:Queues), (ex:Exchanges)
//WHERE b.source = ex.name AND b.destination = qq.name
//CREATE (ex)-[:BINDING]->(qq)

//MERGE (bindings:Bindings {description:b.source}) ON CREATE
//  SET bindings.source = b.source, bindings.destination = b.destination, bindings.destination_type = b.destination_type, bindings.routing_key=b.routing_key
//MATCH (c:Queues {name:"tt"}) RETURN *