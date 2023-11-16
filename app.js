const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ayushman45:revswalekh@cluster0.yyyftcf.mongodb.net/', { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    apiKey: [String]
});

const User = mongoose.model('User', userSchema);

module.exports = User;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.route('/login')
    .get((req, res) => {
        res.send('This is the login form');
    })
    .post((req, res) => {
        console.log(req.body)
        const uname=req.body.username;
        const pass=req.body.password;
        User.findOne({username: uname, password: pass})
        .then((user) => {
            if(user) {
                console.log(user)
                res.send({user: user, message: 'User found',status: 200});
            } else {
                res.send({message: 'User not found',status: 404});
            }
        })
        .catch((err) => {
            res.send({message: err,status: 500});
        });
    });

app.route('/register')
    .get((req, res) => {
        res.send('This is the register form');
    })
    .post((req, res) => {
        console.log(req.body)
        const values=req.body
        const uname=values.username;
        const pass=values.password;
        const name=values.name;

        User.findOne({username: uname})
        .then((user) => {
            if(user) {
                res.send({message: 'User already exists',status: 400});
            } else {
                const newUser = new User({
                    username: uname,
                    password: pass,
                    name: name,
                    apiKey: []
                });
                newUser.save()
                .then((user) => {
                    res.send({user: user, message: 'User created',status: 200});
                })
                .catch((err) => {
                    res.send({message: err,status: 500});
                });
            }
        })
        .catch((err) => {
            res.send({message: err,status: 500});
        });
    });

app.route('/apiKey')
    .post((req, res) => {
        const uname=req.body.username;
        var key = '';
        var n=32;
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < n; i++ ) {
            key += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        const apiKey = key;

        User.findOne({username: uname})
        .then((user) => {
            if(user) {
                if(user.apiKey.length<3){
                    user.apiKey.push(apiKey)
                    user.save()
                    .then((user) => {
                        res.send({user: user, message: 'API Key added',status: 200});
                    })
                    .catch((err) => {
                        res.send({message: err,status: 500});
                    });
                }
                else{
                    res.send({message: 'API Key limit reached',status: 400});
                }
            } else {
                res.send({message: 'User not found',status: 404});
            }
        })
        .catch((err) => {
            res.send({message: err,status: 500});
        });
    });

app.route('/apis')
    .post((req, res) => {
        const username=req.body.username;
        User.findOne({username: username})
        .then((user) => {
            if(user) {
                res.send({user:user,apis: user.apiKey, message: 'APIs found',status: 200});
            } else {
                res.send({message: 'User not found',status: 404});
            }
        })
        .catch((err) => {
            res.send({message: err,status: 500});
        });
    });

app.route('/deleteApiKey')
    .post((req, res) => {
        console.log(req.body.api)
        const username=req.body.username;
        const api=req.body.api;
        User.findOne({username: username})
        .then((user) => {
            if(user) {
                user.apiKey.remove(api)
                user.save()
                .then((user) => {
                    res.send({user: user, message: 'API Key deleted',status: 200});
                })
                .catch((err) => {
                    res.send({message: err,status: 500});
                });
            } else {
                res.send({message: 'User not found',status: 404});
            }
        })
        .catch((err) => {
            res.send({message: err,status: 500});
        });
    });

app.route('/verify')
    .post((req, res) => {
        const token=req.body.token;
        User.findOne({_id: token})
        .then((user) => {
            if(user) {
                res.send({user:user,message: 'User found',status: 200});
            } else {
                res.send({message: 'User not found',status: 404});
            }
        })
        .catch((err) => {
            res.send({message: err,status: 500});
        });
    });

app.listen(8080, () => {
    console.log('Server listening on port 8080');
});