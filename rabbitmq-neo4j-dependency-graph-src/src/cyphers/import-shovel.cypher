WITH {json} as data
UNWIND data.parameters as s
//MATCH (qq:Queues), (ex:Exchanges)
//WHERE b.source = ex.name AND b.destination = qq.name
//CREATE (ex)-[:BINDING]->(qq)

MATCH (source {name:s.value["src"], vhost:s.value["src-uri"]})
MATCH (dest {name:s.value["dest"], vhost:s.value["dest-uri"]})
CREATE (source)-[cs:SHOVEL]->(dest)
SET cs=s.value, cs.name=s.name, cs.vhost=s.vhost, cs.component=s.component
//src_queue:s.value["src-queue"],dest_queue:s.value["dest-queue"],vhost_src:s.value["src-uri"],vhost_dst:s.value["dest-uri"]
//MATCH p=()-[r:BINDING {vhost:"test"}]->() RETURN p LIMIT 25