require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const isVercel = !!process.env.VERCEL;

app.use(cors());
app.use(express.json());

if (isVercel) {
  const apiTools = require('./api/tools.js');
  app.all('/api/tools', (req, res) => apiTools(req, res));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  app.use(express.static(__dirname));
}

module.exports = app;
