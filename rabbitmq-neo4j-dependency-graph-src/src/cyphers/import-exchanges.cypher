WITH {json} as data
UNWIND data.exchanges as e CREATE (exchanges:Exchanges) SET exchanges = e, exchanges.type = "exchange"