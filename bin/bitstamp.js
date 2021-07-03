var WebSocket = require('ws');
bts_markets = ['btc','xrp','ltc','eth','mkr','bch','link','omg','zrx']

module.exports = function bs_initWebsocket() {
        bitstamp_client = new WebSocket("wss://ws.bitstamp.net");

        bitstamp_client.onopen = function() {
            console.log("Bitstamp connection opened");
            for (var x=0; x<bts_markets.length; x++){bitstamp_client.send(JSON.stringify({"event":"bts:subscribe", "data": {"channel":`order_book_${bts_markets[x]}usd`}}));};
        };

        bitstamp_client.onmessage = function(evt) {
            var bts_stream = {
               "exchange": "bitstamp",
               "market":"",
               "bids": "",
               "asks": ""
                    };
            response = JSON.parse(evt.data);
            market = response.channel.replace('order_book_','').slice(0,-(response.channel.length-response.channel.lastIndexOf('u')));

            /**
             * This switch statement handles message logic. It processes data in case of data event
             * and it reconnects if the server requires.
             */
           construct_bts = function(callback){            switch (response.event) {
                case 'data': {
                      bts_stream.bids = [response.data.bids[0][1], response.data.bids[0][0]];
                      bts_stream.asks = [response.data.asks[0][1], response.data.asks[0][0]];
                      bts_stream.market = market;
                      return callback(bts_stream);
                    break;
                }
                case 'bts:request_reconnect': {
                    console.log('Bitstamp requests to reconnect');
                    bs_initWebsocket();
                    break;
                }
            }
          };
        };
        /**
         * In case of unexpected close event, try to reconnect.
         */
        bitstamp_client.onclose = function () {
            console.log('Bitstamp Websocket connection closed');
            bs_initWebsocket();
        };
    };