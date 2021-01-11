require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();


app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`, 
{ useNewUrlParser: true, useUnifiedTopology: true },
(err) => {
    if(!err) {
        console.log('successfully connected to mongoDB');
    } else {
        console.log(err);
    }
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});




const User = new mongoose.model('User', userSchema);




app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) =>  {

    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    const newUser = new User({
        email: req.body.username,
        password: hash 
    });

    newUser.save(err => {
        if(!err) {
            res.render('secrets');
        } else {
            console.log(err)
        }
    });

    })
});

app.post('/login', (req, res) => {
        username = req.body.username;
        password = req.body.password;

        User.findOne({email: username}, (err, foundUser) => {
            if(!err) {
                bcrypt.compare(password, foundUser.password, (err, result) => {
                    if(result) {
                        res.render('secrets')
                    } else {
                        console.log('incorrect password')
                    }

                });
            } else {
                console.log(err)
            }
        });
});












app.listen(3000, () => {
    console.log('Server is running on port 3000');
});