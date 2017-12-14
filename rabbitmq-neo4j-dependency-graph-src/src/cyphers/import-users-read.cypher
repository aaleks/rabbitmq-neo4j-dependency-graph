WITH {currentUser} as data

MATCH (source {user:data["user"], vhost:data["vhost"]})
MATCH (dest {name:data['read'],vhost:data["vhost"]})
CREATE (dest)-[rd:READ]->(source)
SET rd=data

