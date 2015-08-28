
'use strict';

var express = require('express');
var app = express();

var publicDir = __dirname + '/public';


app.get('/*.js', function (req, res) {

  res.sendFile(publicDir + '/js/bundle.js');
});

app.get('*', function (req, res) {

  res.sendFile(publicDir + '/index.html');
});

app.listen(3000, function () {

  console.log('Riot Screen Machine Demo is running on port 3000');
});