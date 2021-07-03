var WebSocket = require('ws');
const zlib = require('zlib');
var markets = require('../util/markets');

var par = []; for (var i=0; i<markets.length; i++){par[i]="spot/depth5:"+markets[i].toUpperCase()+"-USDT"};

//var subscribeMsg = {"op": "subscribe", "args": ["spot/depth5:BTC-USDT","spot/depth5:XRP-USDT","spot/depth5:LTC-USDT","spot/depth5:ETH-USDT","spot/depth5:ADA-USDT"]};
var subscribeMsg = {"op": "subscribe", "args": par};


module.exports = function okex_initWebsocket() {
        okex_client = new WebSocket("wss://real.okex.com:8443/ws/v3")

        okex_client.onopen = function() {
          console.log("OKEx connection opened");
          okex_client.send(JSON.stringify(subscribeMsg));
        };

        okex_client.onmessage = function(evt) {
           var okex_stream = {
               "exchange": "okex",
               "market": "",
               "bids": "",
               "asks": ""
                    };

          const raw = new Buffer.from(evt.data, 'base64');
          zlib.inflateRaw(raw, function (err, inflated) {
             const response = JSON.parse(inflated.toString('utf8'));

             construct_okex = function(callback){           switch (true) {
                  case (response.hasOwnProperty('table')): {
                      okex_stream.market = response.data[0].instrument_id.slice(0,-(response.data[0].instrument_id.length-response.data[0].instrument_id.lastIndexOf('-'))).toLowerCase();
                      okex_stream.bids = [response.data[0].bids[0][1], response.data[0].bids[0][0]];
                      okex_stream.asks = [response.data[0].asks[0][1], response.data[0].asks[0][0]];
                      return callback(okex_stream);
                    break;
                  }
              }

            };
        })
}



        /**
         * In case of unexpected close event, try to reconnect.
         */
        okex_client.onclose = function () {
            console.log('OKEx Websocket connection closed');
            okex_initWebsocket();
        };
    };