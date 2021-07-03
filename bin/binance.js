var WebSocket = require('ws');
var markets = require('../util/markets.js');
var par = [];

for (var i=0; i<markets.length; i++){par[i]=markets[i]+'usdt@depth5'};

//var subscribeMsg = {method: 'SUBSCRIBE', params: ['btcusdt@depth5', 'xrpusdt@depth5', 'ltcusdt@depth5', 'ethusdt@depth5', 'adausdt@depth5', 'hiveusdt@depth5'], id: 1};

var subscribeMsg = {
        method: 'SUBSCRIBE', params: par, id: 1
    };

module.exports = function bin_initWebsocket() {
        binance_client = new WebSocket("wss://stream.binance.com:9443/stream")

        binance_client.onopen = function() {
          console.log("Binance connection opened");
          binance_client.send(JSON.stringify(subscribeMsg));
        };

        binance_client.onmessage = function(evt) {
           var bin_stream = {
               "exchange": "binance",
               "market": "",
               "bids": "",
               "asks": ""
                    };

            response = JSON.parse(evt.data);

            /**
             * This switch statement handles message logic. It processes data in case of data event
             * and it reconnects if the server requires.
             */
           construct_bin = function(callback){           switch (true) {
                  case (response.hasOwnProperty('stream')): {
                      bin_stream.market = response.stream.slice(0,-(response.stream.length-response.stream.lastIndexOf('u')));
                      bin_stream.bids = [response.data.bids[0][1], response.data.bids[0][0]];
                      bin_stream.asks = [response.data.asks[0][1], response.data.asks[0][0]];
                      return callback(bin_stream);
                    break;
                }
            }

          };
        };
        /**
         * In case of unexpected close event, try to reconnect.
         */
        binance_client.onclose = function () {
            console.log('Binance Websocket connection closed');
            bin_initWebsocket();
        };
    };