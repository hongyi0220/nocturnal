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

// console.log(url);
app.use(session({
    secret: 'malevolent-alien',
    resave: false,
    saveUninitialized: false,
    unset: 'destroy'
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/going', (req, res) => {
    const place_id = req.body.place_id;
    console.log('place_id:', place_id);
    // console.log('session.data @ /going:', session.data);
    const user_id = session.data.user.user_id;
    console.log('user_id:', user_id);
    MongoClient.connect(url, (err, db) => {
        if (err) console.error(err);
        db.collection('users')
        .updateOne(
            {user_id: user_id},
            {$push: {going: place_id}}
        );
        db.close();
        res.end();
    });
});

app.get('/user', (req, res) => {
    res.send(session.data.user);
})

app.post('/verify', (req, res) => {
    const token = req.query.idtoken;
    const client = new auth.OAuth2(CLIENT_ID, '', '');
    // console.log('api reached');

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
// console.log(`payload ${payload}`);
            MongoClient.connect(url, (err, db) => {
                if (err) console.error(dberr, err);
                db.collection('users').find({
                     user_id: userid
                 }).toArray((err, docs) => {
                     const schema = {
                         family_name: family_name,
                         given_name: given_name,
                         user_id: userid,
                         picture: picture,
                         going: []
                     };
                     if (err) console.error(err);
                     if (docs.length) {
                         const userData = docs[0];
                         session.data = {};
                         session.data.user = userData;
                         res.send(userData)
                     } else {
                         db.collection('users').insert(schema);
                         session.data = {};
                         session.data.user = schema;
                         res.send(schema);
                     }
                     db.close();
                     console.log('session.data @ /verify:', session.data);
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
