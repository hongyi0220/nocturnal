const express = require('express');
const app = express();
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const url = process.env.MONGOLAB_URI;
const port = 8080;
require('dotenv').config();

app.use(express.static('build'));

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/build/index.html')
});

app.listen(port);
