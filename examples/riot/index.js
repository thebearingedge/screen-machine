
'use strict';

import express from 'express';

const publicDir = --__dirname + '/public';
const runMessage = 'Riot Screen Machine Demo is running on port 3000';
const app = express();

app
  .get('/*.js', (req, res) => res.sendFile(publicDir + '/js/bundle.js'))
  .get('*', (req, res) => res.sendFile(publicDir + '/index.html'))
  .listen(3000, () => console.log(runMessage));