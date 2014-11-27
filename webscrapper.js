var http = require('http');

var options = {
    host: 'www.gosugamers.net',
    port: 80,
    path: '/dota2/gosubet?u-page=1'
};

var exports = module.exports = {};

exports.scrapeSite = function(path, callBack){
    var options = {
        host: 'www.gosugamers.net',
        port: 80,
        path: path
    };
    getPage(options,callBack);
};

var getPage = function(options, callBack){
    http.get(options, function(res) {
        var body='';
        res.on('data', function(chunk){
            body+=chunk;
        });
        res.on('end',function(){
            callBack(body);
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
};



