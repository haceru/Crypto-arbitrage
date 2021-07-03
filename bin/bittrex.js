var brx_stream = {
    "exchange": "bittrex",
    "market": "",
    "bids": "",
    "asks": ""
            };

var mar = require('../util/markets.js');
var channels = []; for (var i=0; i<mar.length; i++){channels[i]='orderbook_'+mar[i].toUpperCase()+'-USDT_1'};
//const channels = ['orderbook_XRP-USDT_1','orderbook_BTC-USDT_1','orderbook_LTC-USDT_1','orderbook_ETH-USDT_1','orderbook_ADA-USDT_1','orderbook_HIVE-USDT_1'];

var markets = []; for (x=0; x<channels.length; x++){markets[x]=channels[x].replace('orderbook_','').slice(0,-(channels[x].length-channels[x].lastIndexOf('_')))}
var o_book = []; for (y=0; y<markets.length; y++){o_book[y]=[{"bids":"", "asks":""}]};

const signalR = require('signalr-client');
const zlib = require('zlib');
const EventEmitter = require('events');
bitEmitter = new EventEmitter();

const url = 'wss://socket-v3.bittrex.com/signalr';
const hub = ['c3'];

var client;
var resolveInvocationPromise = () => { };

async function bittrex() {
  client = await connect();
  await subscribe(client);
}

async function connect() {
  return new Promise((resolve) => {
    const client = new signalR.client(url, hub);
    client.serviceHandlers.messageReceived = messageReceived;
    client.serviceHandlers.connected = () => {
      console.log('Bittrex connection opened');
      return resolve(client)
    }
  });
}

async function subscribe(client) {
  const response = await invoke(client, 'subscribe', channels);

  for (var i = 0; i < channels.length; i++) {
    if (response[i]['Success']) {
      console.log('Subscription to "' + channels[i] + '" successful');
    }
    else {
      console.log('Subscription to "' + channels[i] + '" failed: ' + response[i]['ErrorCode']);
    }
  }
}

async function invoke(client, method, ...args) {
  return new Promise((resolve, reject) => {
    resolveInvocationPromise = resolve; // Promise will be resolved when response message received

    client.call(hub[0], method, ...args)
      .done(function (err) {
        if (err) { return reject(err); }
      });
  });
}

function messageReceived(message) {
  const data = JSON.parse(message.utf8Data);

  if (data['R']) {
    resolveInvocationPromise(data.R);
  }
  else if (data['M']) {
    data.M.forEach(function (m) {
      if (m['A']) {
        if (m.A[0]) {
          const b64 = m.A[0];
          const raw = new Buffer.from(b64, 'base64');

          zlib.inflateRaw(raw, function (err, inflated) {
            if (!err) {
              const json = JSON.parse(inflated.toString('utf8'));
              var mkt = markets.indexOf(json.marketSymbol);

              brx_stream.market = json.marketSymbol.replace('orderbook_','').slice(0,-(json.marketSymbol.length-json.marketSymbol.lastIndexOf('-'))).toLowerCase();

              if (Object.values(json.bidDeltas) !== null && Object.values(json.bidDeltas) != "")
                 {var temp_bid = (Object.values(json.bidDeltas)); if (temp_bid[0].quantity != "0"){o_book[mkt].bids = Object.values(temp_bid[0])} else {o_book[mkt].bids = Object.values(temp_bid[1])};};
              if (Object.values(json.askDeltas) !== null && Object.values(json.askDeltas) != "")
                 {var temp_ask = (Object.values(json.askDeltas)); if (temp_ask[0].quantity != "0"){o_book[mkt].asks = Object.values(temp_ask[0])} else {o_book[mkt].asks = Object.values(temp_ask[1])};};
              brx_stream.bids = o_book[mkt].bids; 
              brx_stream.asks = o_book[mkt].asks;
              bitEmitter.emit('event',brx_stream);

            }
          });
        }
      }
    });
  }

}

module.exports = {bittrex, bitEmitter};