WITH {currentUser} as data

MATCH (source {user:data["user"], vhost:data["vhost"]})
MATCH (dest {name:data['write'],vhost:data["vhost"]})
CREATE (source)-[wr:WRITES]->(dest)
SET wr=data

