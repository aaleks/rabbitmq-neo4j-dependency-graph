WITH {json} as data
UNWIND data.permissions as u CREATE (users:Users) SET users = u
