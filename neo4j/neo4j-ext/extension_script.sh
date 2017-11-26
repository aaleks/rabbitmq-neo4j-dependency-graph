#! /bin/bash
echo "dbms.security.procedures.whitelist=apoc.load.*,apoc.date.* apoc.number.*, apoc.coll.*, apoc.map.*,apoc.*" >> /var/lib/neo4j/conf/neo4j.conf
echo "apoc.import.file.enabled=true" >> /var/lib/neo4j/conf/neo4j.conf