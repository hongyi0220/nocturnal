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
const errmsg = 'There was a problem connecting to database ';

app.use(session({
    secret: 'malevolent-alien',
    resave: false,
    saveUninitialized: false,
    unset: 'destroy'
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/mapdata', (req, res) => {
     let searchValue, markers;
     if(session.data) {
         searchValue = session.data.searchValue || '';
         markers = session.data.markers;
     } else searchValue = '';
     const response = {searchValue: searchValue, markers: markers};

     res.send(response);
});

app.post('/searchvalue', (req, res) => {
    const searchValue = req.body.searchValue;

    session.data.searchValue = searchValue;
    res.end();
});

app.post('/markers', (req, res) => {
    const markers = req.body.markers;

    session.data.markers = markers;
    res.end();
});

app.get('/signout', (req, res) => {
    session.data = null;
    res.end();
});

app.get('/goingsdata', (req, res) => {
    MongoClient.connect(url, (err, db) => {
        if (err) console.error(errmsg, err);
        const col = db.collection('goings');
        col.find({}).toArray((err, docs) => {
            const goingsData = docs[0];
            res.send(goingsData);
            db.close();
        });
    });
});

app.post('/going', (req, res) => {
    const place_id = req.body.place_id;
    const user_id = session.data.user.user_id;
    MongoClient.connect(url, (err, db) => {
        if (err) console.error(err);

        const collection = db.collection('users');
        const goings = db.collection('goings');
        collection
        .find({user_id: user_id})
        .toArray((err, docs) => {
            if (err) console.error(err);
            const userData = docs[0];
            const updatedInc = {}, updatedDec = {};
            updatedInc[place_id] = 1;
            updatedDec[place_id] = -1;

            // Update bars where the user is going, increase the # of people going to a particular bars
            //in the goings database
            if (userData.going.indexOf(place_id) > -1) {

                collection.updateOne(
                    {user_id: user_id},
                    {$pull: {going: place_id}}
                );

                goings.updateOne(
                    {},
                    {
                        $inc: updatedDec
                    }
                );

            } else {
                collection.updateOne(
                    {user_id: user_id},
                    {$push: {going: place_id}}
                );

                goings.updateOne(
                    {},
                    {
                        $inc: updatedInc
                    }
                );

            }
            db.close();
            res.end();
        });

    });
});

app.get('/user', (req, res) => {
    res.send(session.data.user);
})

app.post('/verify', (req, res) => {
    const token = req.query.idtoken;
    const client = new auth.OAuth2(CLIENT_ID, '', '');

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

            MongoClient.connect(url, (err, db) => {
                if (err) console.error(errmsg, err);
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
                         if (!session.data) session.data = {};
                         session.data.user = userData;
                         res.send(userData)
                     } else {
                         db.collection('users').insert(schema);
                         if (!session.data) session.data = {};
                         session.data.user = schema;
                         res.send(schema);
                     }
                     db.close();
                 });
            });
        }
    );
});

app.use(express.static('build'));

app.get('*', (req, res) => {
    if (!session.data) session.data = {};
    res.sendFile(__dirname + '/build/index.html')
});

app.listen(port);
