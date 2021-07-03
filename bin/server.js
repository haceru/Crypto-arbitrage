var app = require('../app');
var debug = require('debug')('myapp:server');
var http = require('http');
var WebSocket = require('ws');


var bitstamp = require('../bin/bitstamp.js');
bitstamp();

var bittrex = require('../bin/bittrex.js');
bittrex.bittrex();

var binance = require('../bin/binance.js');
binance();

var okex = require('../bin/okex.js');
okex();

var huobi = require('../bin/huobi.js');
huobi();

var stex = require('../bin/stex.js');
stex.stex();

/**
 * Create HTTP server.
 */

var http_server = http.createServer(app);

/**
 * Create Websocket server
 */


var local_ws_server = new WebSocket.Server({ server:http_server });

local_ws_server.on('connection', function connection(ws) {

  var fwd_bts = function() {construct_bts(function(bts_stream) {ws.send(JSON.stringify(bts_stream));})};
  var fwd_bin = function() {construct_bin(function(bin_stream) {ws.send(JSON.stringify(bin_stream));});};
  var fwd_okex = function() {construct_okex(function(okex_stream) {ws.send(JSON.stringify(okex_stream));});};
  var fwd_btrx = function(brx_stream) {ws.send(JSON.stringify(brx_stream));};
  var fwd_huo = function() {construct_huo(function(huo_stream) {ws.send(JSON.stringify(huo_stream));});};
  var fwd_stex = function(stex_stream) {ws.send(JSON.stringify(stex_stream));};

  ws.on('message', function incoming(message) {console.log('received: %s', message);});

  bitstamp_client.on('message', fwd_bts);
  binance_client.on('message', fwd_bin);
  okex_client.on('message', fwd_okex);
  bittrex.bitEmitter.on('event', fwd_btrx);
  huobi_client.on('message', fwd_huo);
  stex.stexEmitter.on('event', fwd_stex);

//  bitstamp_client.on('message', function incoming(data) {construct_bts(function(bts_stream) {ws.send(JSON.stringify(bts_stream));});});
//  binance_client.on('message', function incoming(data) {construct_bin(function(bin_stream) {ws.send(JSON.stringify(bin_stream));});});
//  bittrex.myEmitter.on('event', function(brx_stream){ws.send(JSON.stringify(brx_stream));});
//  okex_client.on('message', function incoming(data) {construct_okex(function(okex_stream) {ws.send(JSON.stringify(okex_stream));});});

  ws.onclose = function(){

       bitstamp_client.removeEventListener('message', fwd_bts);
       binance_client.removeEventListener('message', fwd_bin);
       okex_client.removeEventListener('message', fwd_okex);
       bittrex.bitEmitter.removeListener('event', fwd_btrx);
       huobi_client.removeEventListener('message', fwd_huo);
       stex.stexEmitter.removeListener('event', fwd_stex);

       socketstate = 0;ws.terminate();console.log("Client closed connection");};

});

module.exports = {http_server};