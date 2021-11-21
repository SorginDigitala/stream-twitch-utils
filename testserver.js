var express = require('express');
var server = express();
var port = 12121
//require('dotenv').config({ path: '../config/.env' })

console.log(process.env.CLIENT_ID)
//var server = express.createServer();
// express.createServer()  is deprecated.

server.use('/', express.static(__dirname + '/'));
console.log("Listen "+port)
server.listen(port);
