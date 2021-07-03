var WebSocket = require('ws');
const zlib = require('zlib');
var markets = require('../util/markets.js');
var par = [];

for (var i=0; i<markets.length; i++){par[i]='market.'+markets[i]+'usdt.mbp.refresh.5'};

module.exports = function huo_initWebsocket() {
        huobi_client = new WebSocket("wss://api-aws.huobi.pro/ws")

        huobi_client.onopen = function() {
          console.log("Huobi connection opened");
          for (var x=0; x<markets.length; x++){huobi_client.send(JSON.stringify({"sub":par[x], "id":`id+${x}`}));}
        };

        huobi_client.onmessage = function(evt) {

           var huo_stream = {
               "exchange": "huobi",
               "market": "",
               "bids": "",
               "asks": ""
                    };

            const raw = new Buffer.from(evt.data, 'base64');
            zlib.gunzip(raw, function (err, buf) {
               const response = JSON.parse(buf.toString('utf8'));

                    // heartbeat reply

               keep_alive = function(){switch(true){
                   case (response.hasOwnProperty('ping')): {var pong ={"pong":response.ping}; huobi_client.send(JSON.stringify(pong));break;}}}
               keep_alive();


            /**
             * This switch statement handles message logic. It processes data in case of data event
             * and it reconnects if the server requires.
             */

               construct_huo = function(callback){switch (true) {
                  case (response.hasOwnProperty('ch')): {

                      huo_stream.market = response.ch.slice(7,-(response.ch.length-response.ch.lastIndexOf('u')));
                      huo_stream.bids = [response.tick.bids[0][1], response.tick.bids[0][0]];
                      huo_stream.asks = [response.tick.asks[0][1], response.tick.asks[0][0]];
                      return callback(huo_stream);
                    break;
                                              }
                                       }
                            }

                   });
           }

        /**
         * In case of unexpected close event, try to reconnect.
         */

        huobi_client.onclose = function () {
            console.log('Huobi connection closed');
            huo_initWebsocket();
          };
}