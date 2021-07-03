var io = require("socket.io-client");
const EventEmitter = require('events');
stexEmitter = new EventEmitter();

function stex (){
  var stex_client = io.connect("https://socket.stex.com");
  var stex_markets = [['btc','406'],['eth','407'],['ltc','408'],['xrp','755']];
  var price_type = ['bid','ask']

  for (var i=0; i<stex_markets.length; i++){for (var k=0;k<price_type.length;k++){
      stex_client.emit('subscribe', {channel:`best_${price_type[k]}_price_${stex_markets[i][1]}`});};
          };
  console.log("Stex connection opened");

  stex_client.on('App\\Events\\BestPriceChanged', function(msg, obj) {
           var stex_stream = {
               "exchange": "stex",
               "market": "",
               "bids": "",
               "asks": ""
                    };

           for (var j=0; j<stex_markets.length; j++) {if (obj.currency_pair_id == stex_markets[j][1]){stex_stream.market = stex_markets[j][0]};};
           if (obj.order_type_id === 1){stex_stream.bids = obj.best_price} else {stex_stream.asks = obj.best_price};
           stexEmitter.emit('event',stex_stream);
   });
}

module.exports = {stex, stexEmitter};