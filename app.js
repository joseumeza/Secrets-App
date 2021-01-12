require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose'); 

const app = express();



app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: 'abigsecret.',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`, 
{ useNewUrlParser: true, useUnifiedTopology: true },
(err) => {
    if(!err) {
        console.log('successfully connected to mongoDB');
    } else {
        console.log(err);
    }
});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/secrets', (req, res) => {
    User.find({'secret': {$ne: null}}, (err, foundUsers) => {
        if (!err) {
            res.render('secrets', {usersWithSecrets: foundUsers});
        } else {
            console.log(err)
        }
    })
});

app.get('/submit', (req, res) => {
    if(req.isAuthenticated()) {
        res.render('submit');
    } else {
        res.redirect('/login');
    }
});

app.post('/submit', (req, res) => {
    const submittedSecret = req.body.secret;

    User.findById(req.user.id, (err, foundUser) =>  {
        if(!err) {
            foundUser.secret = submittedSecret;
            foundUser.save( () => {
                res.redirect('/secrets');
            });

        } else {
            console.log(err);
        }

    });

});

app.post("/register", function(req, res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/secrets");
        });
      }
    });
  
  });

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user,  (err) => {
        if(!err) {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });

        } else {
            console.log(err)

        }
    })
     
});












app.listen(3000, () => {
    console.log('Server is running on port 3000');
});