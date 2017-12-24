const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
require('dotenv').config();
const url = process.env.MONGOLAB_URI;
const port = process.env.PORT || 8080;
const GoogleAuth = require('google-auth-library');
const auth = new GoogleAuth;
const CLIENT_ID = '872003218674-6gu6efj6ani525f6secv0bqdqefmnrb8.apps.googleusercontent.com';
const dberr = 'There was a problem connecting to database ';

console.log(url);
app.use(session({
    secret: 'malevolent-alien',
    resave: false,
    saveUninitialized: false,
    unset: 'destroy'
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/user', (req, res) => {
    res.send(session.data.user);
})

app.post('/verify', (req, res) => {
    const token = req.query.idtoken;
    const client = new auth.OAuth2(CLIENT_ID, '', '');
    console.log('api reached');

    client.verifyIdToken(
        token,
        CLIENT_ID,
        (e, login) => {
            if (e) console.error(e);
            const payload = login.getPayload();
            const userid = payload['sub'];
            const family_name = payload.family_name;
            const given_name = payload.given_name;
            const picture = payload.picture;
console.log(`payload ${payload}`);
            MongoClient.connect(url, (err, db) => {
                if (err) console.error(dberr, err);
                db.collection('users').find({
                     user_id: userid
                 }).toArray((err, docs) => {
                     const schema = {
                         family_name: family_name,
                         given_name: given_name,
                         user_id: userid,
                         picture: picture
                     };
                     if (err) console.error(err);
                     if (!docs.length) db.collection('users').insert(schema);
                     db.close();
                     session.data = {};
                     session.data.user = schema;
                     res.send(schema);
                 });
            });
        }
    );
});

app.use(express.static('build'));

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/build/index.html')
});

app.listen(port);
