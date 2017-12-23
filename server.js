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

console.log(url);
app.use(session({
    secret: 'malevolent-alien',
    resave: false,
    saveUninitialized: false,
    unset: 'destroy'
}));

app.use(bodyParser.urlencoded({ extended: true }));

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
            res.end();
        }
    )
});

app.post('/login', (req, res) => {
    MongoClient.connect(url, (err, db) => {
        if (err) console.error('There was a problem connecting to database ', err);
        // Check for username and password in db
        db.collection('users').find({
             username: req.body.username,
             password: req.body.password
         }).toArray((err, docs) => {
             // Work with docs
             if (err) console.error(err);
             if (docs.length) {
                 session.data = {};
                 session.data.user = docs[0];
                 // db.collection('polls').find({
                 //     username: req.body.username
                 // }).toArray((err, polls) => {
                 //     if (err) console.error(err);
                 //     if (polls.length) session.data.mypolls = polls;
                 //     res.redirect('/');
                 //     db.close();
                 // })
             } else {
                 res.redirect('/login/error');
                 db.close();
             };
         });
    });
});

app.post('/signup', (req, res) => {
    MongoClient.connect(url, (err, db) => {
        if (err) console.error('There was a problem connecting to database ', err);
        // Look up db for username and email already taken
        db.collection('users')
        .find({ username: req.body.username })
        .toArray((err, docs) => {
            if (err) console.error(err);
            if (docs.length) res.redirect('/signup/usernameerror');
            else {
                db.collection('users').find({ email: req.body.email })
                .toArray((err, docs) => {
                    if (err) console.error(err);
                    if (docs.length) res.redirect('/signup/emailerror');
                    else {
                        const schema = {
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            username: req.body.username,
                            password: req.body.password,
                            email: req.body.email
                        };
                        db.collection('users').insert(schema);
                        db.close();
                        session.data = {};
                        session.data.user = schema;
                        res.redirect('/')
                    }
                });
            }
        });
    });
});

app.use(express.static('build'));

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/build/index.html')
});

app.listen(port);
