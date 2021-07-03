function VanillaData() {
   var exchanges = ["bitstamp", "binance", "bittrex", "huobi", "okex", "stex"];

   generate_table();
   initWebsocket();

   function generate_table(){
     var table_header = ["Market", "Bitstamp", "Binance", "Bittrex", "Huobi", "OKEx", "Stex", "Profit"];
     tbl = document.createElement("table");

     tblHeader = document.createElement("thead");
       tblHeader.setAttribute("bgcolor", "#80b3ff");
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
             cell.setAttribute("bgcolor", "#ffe6cc");
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

   function initWebsocket(){
      var ws = new WebSocket("ws://192.168.0.111:3000");
      var comp_array = []; for (x=0; x<markets.length; x++){comp_array[x]=[]; for (y=0; y<exchanges.length; y++){comp_array[x][y]={market:markets[x],exchange:exchanges[y]}}};

      ws.onerror = function(err) {
                console.error('failed to make websocket connection');
                throw err;
            };
      ws.onopen = function() {
               console.log('connection established');
               ws.send('bu'); };
      ws.onmessage = function(evt) {
               response = JSON.parse(evt.data);

      function populate_table() {var mkt = markets.indexOf(response.market); var exc = exchanges.indexOf(response.exchange);

         if (typeof(response.bids)!== "undefined" && response.bids !== null && response.bids != "" && typeof(response.asks)!== "undefined" && response.asks !== null && response.asks != ""){

               var mkt_comp_obj = {market:response.market, exchange:response.exchange, bid:response.bids[1], ask:response.asks[1]};
               comp_array[mkt][exc] = mkt_comp_obj;

               var max_bid = comp_array[mkt].reduce(function(prev, current) {return (prev.bid > current.bid || current.bid == null) ? prev : current});
               var min_ask = comp_array[mkt].reduce(function(prev, current) {return (prev.ask < current.ask || current.ask == null) ? prev : current});

                   if (max_bid.bid > min_ask.ask) {var mb = parseFloat(max_bid.bid).toFixed(2); var ma = parseFloat(min_ask.ask).toFixed(2);
                        comp_array[mkt].forEach(function(el){window[el.exchange+el.market].textContent = "no action", window[el.exchange+response.market].style.backgroundColor = "Azure"}),
                        window[max_bid.exchange+max_bid.market].textContent = `Sell @ ${mb}`, window[max_bid.exchange+max_bid.market].style.backgroundColor = "#ffb3b3",
                        window[min_ask.exchange+min_ask.market].textContent = `Buy @ ${ma}`, window[min_ask.exchange+min_ask.market].style.backgroundColor = "#b3ffb3",
                        window[response.market+"profit"].textContent = `${parseFloat((max_bid.bid - min_ask.ask)*100/max_bid.bid).toFixed(2)}`;
                                      if( window[response.market+"profit"].textContent > 1){window[response.market+"profit"].style.backgroundColor = "PaleGreen";} 
                                      else {window[response.market+"profit"].style.backgroundColor = "Azure";};
}

                     else{comp_array[mkt].forEach(function(el){
                        window[el.exchange+el.market].textContent = "no action", window[el.exchange+response.market].style.backgroundColor = "Azure",
                        window[el.market+"profit"].textContent = "0", window[el.market+"profit"].style.backgroundColor = "Azure"})}
                  }
         else {window[response.exchange+response.market].textContent = "no data"}
           }




   populate_table();

   function sortTable() {

     var colIndex = (exchanges.length+1);
     var tbr = tblBody.rows.length;
     var rows = [];
       if (tblBody != null && window[response.market+"profit"].textContent > 10) {
         for (var i = 0; i < tbr; i++) {
           rows.push(tblBody.rows[i]);
             }
           rows.sort( function ( a, b ) { return b.cells[colIndex].textContent - a.cells[colIndex].textContent; });
         for (var i = 0; i < rows.length; i++) {
           tblBody.appendChild(rows[i]);
             }
         window[response.market+"profit"].style.backgroundColor = "PaleGreen";
          }
       }

//   sortTable();
                  }
           }
}