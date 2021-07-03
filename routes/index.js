var express = require('express');
var router = express.Router();
var markets = require('../util/markets.js');

//var requestTime = function (req, res, next) {
//  req.requestTime = (new Date()).toString()
//  next()
//};

//router.use(requestTime);

/* GET home page. */

router.get('/', function(req, res, next) {
   res.render('index', {title:'Express', markets});
});


module.exports = router;
