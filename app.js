require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt =  require('mongoose-encryption');

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



userSchema.plugin(encrypt, {secret: process.env.SECRET_STRING, encryptedFields: ['password'] });

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
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(err => {
        if(!err) {
            res.render('secrets');
        } else {
            console.log(err)
        }
    });


});

app.post('/login', (req, res) => {
    username = req.body.username;
    password = req.body.password;

    User.findOne({email: username}, (err, foundUser) => {
        if(!err) {
            if(foundUser && foundUser.password === password) {
                res.render('secrets')
            }
        } else {
            console.log(err)
        }
    });
});












app.listen(3000, () => {
    console.log('Server is running on port 3000');
});