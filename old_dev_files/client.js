function VanillaData() {
   var markets = ["btc", "xrp", "ltc", "eth"];
   var exchanges = ["bitstamp", "binance", "bittrex"];



   generate_table();
   initWebsocket();

   function generate_table(){
     var table_header = ["Market", "Bitstamp", "Binance","Bittrex", "Profit"];
     tbl = document.createElement("table");

     tblHeader = document.createElement("thead");
       var row = document.createElement("tr");
         for (var h=0; h < table_header.length; h++){
           var th = document.createElement("th");
           var thText = document.createTextNode(table_header[h]);
           th.appendChild(thText);
           row.appendChild(th);
         }
       tblHeader.appendChild(row);
     tbl.appendChild(tblHeader);

    tblBody = document.createElement("tbody");
         for (var m=0; m < markets.length; m++){ 
           var row = document.createElement("tr");
             var cell = document.createElement("td");
             var cellText = document.createTextNode(markets[m].toUpperCase());
             cell.setAttribute("class", "td");
             cell.appendChild(cellText);
             row.appendChild(cell);
           for (var e=0; e < exchanges.length; e++){
             var cell = document.createElement("td");
             var cellText = document.createTextNode("");
             cell.setAttribute("id",exchanges[e]+markets[m]);
             cell.setAttribute("class","td1");
             cell.appendChild(cellText);
             row.appendChild(cell);
           }
           var cell = document.createElement("td");
           var cellText = document.createTextNode("");
           cell.setAttribute("id",markets[m]+"profit");
           cell.setAttribute("class","td1");
           row.appendChild(cell);

           tblBody.appendChild(row);
         }

    tbl.appendChild(tblBody);
    gen_table.appendChild(tbl);
    }


//   function bts_serializeData(r) {bts_bid = r.bids[1]; bts_ask = r.asks[1]; 
//        btsbidsPlaceholder.innerHTML = '';
//        btsasksPlaceholder.innerHTML = '';
//        btsspreadsPlaceholder.innerHTML = '';

//            btsbidsPlaceholder.innerHTML = btsbidsPlaceholder.innerHTML + r.bids[0] + ' BTC @ ' + r.bids[1] + ' USD' + '<br />';
//            btsasksPlaceholder.innerHTML = btsasksPlaceholder.innerHTML + r.asks[0] + ' BTC @ ' + r.asks[1] + ' USD' + '<br />';
//            btsspreadsPlaceholder.innerHTML = btsspreadsPlaceholder.innerHTML + parseFloat(r.asks[1]-r.bids[1]).toFixed(2) + ' USD' + '<br />';
//    }


//   function bin_serializeData(r) {bin_bid = parseFloat(r.bids[1]).toFixed(2); bin_ask = parseFloat(r.asks[1]).toFixed(2); 
//        binbidsPlaceholder.innerHTML = '';
//        binasksPlaceholder.innerHTML = '';
//        binspreadsPlaceholder.innerHTML = '';

//            binbidsPlaceholder.innerHTML = binbidsPlaceholder.innerHTML + r.bids[0] + ' BTC @ ' + parseFloat(r.bids[1]).toFixed(2) + ' USD' + '<br />';
//            binasksPlaceholder.innerHTML = binasksPlaceholder.innerHTML + r.asks[0] + ' BTC @ ' + parseFloat(r.asks[1]).toFixed(2) + ' USD' + '<br />';
//            binspreadsPlaceholder.innerHTML = binspreadsPlaceholder.innerHTML + parseFloat(r.asks[1]-r.bids[1]).toFixed(2) + ' USD' + '<br />';
//    }



//   function compare() {
//                       if (bts_bid > bin_ask) {btsop.innerHTML = "Sell", btsop.style.backgroundColor = "orange", 
//                                               binop.innerHTML = "Buy", binop.style.backgroundColor = "green", 
//                                               prof.innerHTML = parseFloat((bts_bid - bin_ask)*100/bts_bid).toFixed(2), prof.style.backgroundColor = "SpringGreen"}

//                         else {if (bin_bid > bts_ask) {btsop.innerHTML = "Buy", btsop.style.backgroundColor = "green", 
//                                                       binop.innerHTML = "Sell", binop.style.backgroundColor = "orange",
//                                                       prof.innerHTML = parseFloat((bin_bid - bts_ask)*100/bin_bid).toFixed(2), prof.style.backgroundColor = "SpringGreen"} 
//                               else {btsop.innerHTML = "no action", btsop.style.backgroundColor = "Azure", 
//                                     binop.innerHTML = "no action", binop.style.backgroundColor = "Azure", 
//                                     prof.innerHTML = "no profit", prof.style.backgroundColor = "Azure"} };
//    }

   function initWebsocket(){
      var ws = new WebSocket("ws://192.168.0.111:3000");
      var btc_comp_array = [];
      var xrp_comp_array = [];
      var comp_array = []; for (x=0; x<markets.length; x++){comp_array[x]=[]; for (y=0; y<exchanges.length; y++){comp_array[x][y]={market:markets[x],exchange:exchanges[y]}}};
      var exc_comp_array = [];
      var mkt_comp_array = [];

      ws.onerror = function(err) {
                console.error('failed to make websocket connection');
                throw err;
            };
      ws.onopen = function() {
               console.log('connection established');
               ws.send('bu'); };
      ws.onmessage = function(evt) {
                response = JSON.parse(evt.data);
//console.log(response);
   function t() {var mkt = markets.indexOf(response.market); var exc = exchanges.indexOf(response.exchange);
              var mkt_comp_obj = {market:response.market, exchange:response.exchange, bid:response.bids[1], ask:response.asks[1]};
              comp_array[mkt][exc] = mkt_comp_obj;

              var max_bid = comp_array[mkt].reduce(function(prev, current) {return (prev.bid > current.bid) ? prev : current});
              var min_ask = comp_array[mkt].reduce(function(prev, current) {return (prev.ask < current.ask) ? prev : current});

                   if (max_bid.bid > min_ask.ask) {var mb = parseFloat(max_bid.bid).toFixed(2); var ma = parseFloat(min_ask.ask).toFixed(2);
                        comp_array[mkt].forEach(function(el){eval(el.exchange+el.market).textContent = "no action", eval(el.exchange+response.market).style.backgroundColor = "Azure"}),
                        eval(max_bid.exchange+max_bid.market).textContent = `Sell @ ${mb}`, eval(max_bid.exchange+max_bid.market).style.backgroundColor = "orange",
                        eval(min_ask.exchange+min_ask.market).textContent = `Buy @ ${ma}`, eval(min_ask.exchange+min_ask.market).style.backgroundColor = "green",
                        eval(response.market+"profit").textContent = `${parseFloat((max_bid.bid - min_ask.ask)*100/max_bid.bid).toFixed(2)} %`, eval(response.market+"profit").style.backgroundColor = "SpringGreen";}

                     else{comp_array[mkt].forEach(function(el){
                        eval(el.exchange+el.market).textContent = "no action", eval(el.exchange+response.market).style.backgroundColor = "Azure",
                        eval(el.market+"profit").textContent = "no profit", eval(el.market+"profit").style.backgroundColor = "Azure"})}
   }

   t();

//                switch (response.exchange) {
//                     case 'bitstamp':{
//                               switch (response.market) {case 'btc':{
//                                     var btc_comp_obj = {exchange:response.exchange,bid:response.bids[1],ask:response.asks[1]};
//                                     bts_serializeData(response);
//                                     btc_comp_array[0] = btc_comp_obj;
//                                                         break;}

//                                                         case 'xrp':{
//                                     var xrp_comp_obj = {exchange:response.exchange,bid:response.bids[1],ask:response.asks[1]};
//                                     bts_serializeData(response);
//                                     xrp_comp_array[0] = xrp_comp_obj;
//                                                         break;}
//                                                         }
//                     break;}

//                     case 'binance':{
//                             switch (response.market) {case 'btc':{
//                                   var btc_comp_obj = {exchange:response.exchange,bid:parseFloat(response.bids[1]).toFixed(2),ask:parseFloat(response.asks[1]).toFixed(2)};
//                                   bin_serializeData(response);
//                                   btc_comp_array[1] = btc_comp_obj;
//                                                       break;}
//                                                       }
//                     break;}
//               }

//                compare();

//                var max_bid = btc_comp_array.reduce(function(prev, current) {return (prev.bid > current.bid) ? prev : current});
//                var min_ask = btc_comp_array.reduce(function(prev, current) {return (prev.ask < current.ask) ? prev : current});

//                function ex(){
//                   if (max_bid.bid > min_ask.ask) {
//                                            eval(max_bid.exchange).innerHTML = "Sell", eval(max_bid.exchange).style.backgroundColor = "orange",
//                                            eval(min_ask.exchange).innerHTML = "Buy", eval(min_ask.exchange).style.backgroundColor = "green",
//                                            profit.innerHTML = parseFloat((max_bid.bid - min_ask.ask)*100/max_bid.bid).toFixed(2), profit.style.backgroundColor = "SpringGreen"}
//                     else{btc_comp_array.forEach(function(item){eval(item.exchange).innerHTML = "no action", eval(item.exchange).style.backgroundColor = "Azure"}),
//                        profit.innerHTML = "no profit", profit.style.backgroundColor = "Azure"
//                                      };
//                          }
//                ex();


                  }
           }
}