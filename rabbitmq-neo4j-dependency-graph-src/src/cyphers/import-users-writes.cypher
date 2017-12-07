WITH {json} as data
UNWIND data.parameters as u CREATE (users:Users) SET users = u

//read part
MATCH (source {name:s.value["src"], vhost:s.value["src-uri"]})
MATCH (dest {name:s.value["dest"], vhost:s.value["dest-uri"]})
CREATE (source)-[cs:SHOVEL]->(dest)
SET cs=s.value, cs.name=s.name, cs.vhost=s.vhost, cs.component=s.component


//write