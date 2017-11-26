WITH {json} as data
UNWIND data.parameters as s
//MATCH (qq:Queues), (ex:Exchanges)
//WHERE b.source = ex.name AND b.destination = qq.name
//CREATE (ex)-[:BINDING]->(qq)
MATCH (sourceQueue:Queues {name:s.value["src-queue"], vhost:s.value["src-uri"]})
MATCH (destQueue:Queues {name:s.value["dest-queue"], vhost:s.value["dest-uri"]})
CREATE (sourceQueue)-[:SHOVEL {name:s.name, vhost: s.vhost, component:s.component,src_queue:s.value["src-queue"],dest_queue:s.value["dest-queue"],vhost_src:s.value["src-uri"],vhost_dst:s.value["dest-uri"]}]->(destQueue)

//MATCH p=()-[r:BINDING {vhost:"test"}]->() RETURN p LIMIT 25