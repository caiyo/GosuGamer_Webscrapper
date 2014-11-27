var db = require('pg');
var props =require('./dbProperties.js');

var connString = 'postgres://'+props.username+':'+props.password+'@'+props.servername+':'+props.portNum+'/'+props.database;
var dbConnect = {};

dbConnect.connect = function(query){
	db.connect(connString, query);
	db.end();
};

module.exports = dbConnect;