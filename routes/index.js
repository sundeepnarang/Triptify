var express = require('express');
var router = express.Router();
var lib = require('../library/routesLib')
var passport = lib.passport;
var data = {};
var flights = {};
var region  = {};
var User       = require('../models/user');
var util        = require('util');
// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

// normal routes ===============================================================

// show the home page (will also have our login links)
router.get('/', function(req, res) {
    res.render('index',{'title':'Welcome'});
});

// PROFILE SECTION =========================
router.get('/home', isLoggedIn, function(req, res) {
    res.render('home', {'title':'Home'});
});

router.post('/search', isLoggedIn, function(req, res) {
    lib.search(req.user.ExtId,req.body,req.ip,req.get('user-agent'),function(hotel){
        res.render('home', {'title':'Home',hotel:hotel});
    });

});

// LOGOUT ==============================
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

// locally --------------------------------
// LOGIN ===============================
// show the login form
router.get('/login', function(req, res) {
    res.render('login', {title:'Login', message: req.flash('loginMessage') });
});

// process the login form
router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/list', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// SIGNUP =================================
// show the signup form
router.get('/signup', function(req, res) {
    res.render('signup', { title:'Signup', message: req.flash('signupMessage') });
});

// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/list', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// facebook -------------------------------

// send to facebook to do the authentication
router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

// twitter --------------------------------

// send to twitter to do the authentication
router.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

// handle the callback after twitter has authenticated the user
router.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));


// google ---------------------------------

// send to google to do the authentication
router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

// the callback after google has authenticated the user
router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

// locally --------------------------------
router.get('/connect/local', function(req, res) {
    res.render('connect-local', { message: req.flash('loginMessage') });
});
router.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// facebook -------------------------------

// send to facebook to do the authentication
router.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

// handle the callback after facebook has authorized the user
router.get('/connect/facebook/callback',
    passport.authorize('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

// twitter --------------------------------

// send to twitter to do the authentication
router.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

// handle the callback after twitter has authorized the user
router.get('/connect/twitter/callback',
    passport.authorize('twitter', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));


// google ---------------------------------

// send to google to do the authentication
router.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

// the callback after google has authorized the user
router.get('/connect/google/callback',
    passport.authorize('google', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

// local -----------------------------------
router.get('/unlink/local', isLoggedIn, function(req, res) {
    var user            = req.user;
    user.local.email    = undefined;
    user.local.password = undefined;
    user.save(function(err) {
        res.redirect('/profile');
    });
});

// facebook -------------------------------
router.get('/unlink/facebook', isLoggedIn, function(req, res) {
    var user            = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
        res.redirect('/profile');
    });
});

// twitter --------------------------------
router.get('/unlink/twitter', isLoggedIn, function(req, res) {
    var user           = req.user;
    user.twitter.token = undefined;
    user.save(function(err) {
        res.redirect('/profile');
    });
});

// google ---------------------------------
router.get('/unlink/google', isLoggedIn, function(req, res) {
    var user          = req.user;
    user.google.token = undefined;
    user.save(function(err) {
        res.redirect('/profile');
    });
});

//extension

router.post('/saveh',function(req,res){
    var id = req.body.id;
    if(!data[id]){
        data[id] = {};
    }
    var urlObject = req.body.urlData;
    var tripId = urlObject.regionId + "|" + urlObject.startDate + "|" + urlObject.endDate ;
    if(!data[id][tripId]){
        data[id][tripId] = {};
    }
   // var regex = new RegExp("+", "g");
    region[urlObject.regionId] = urlObject.destination.replace(/\+/g," ");

    data[id][tripId][req.body.data.hotelId] = req.body.data;
    console.log("Data : \n\n",util.inspect(data));
    console.log("\n\nRegion : \n\n",util.inspect(region));
    res.send(true);
});

router.post('/savef',function(req,res){
    var id = req.body.id;
    if(!flights[id]){
        flights[id] = {};
    }
    var urlObject = req.body.urlData;
    var tripId;
    if(!urlObject.leg){
        tripId = urlObject.leg1;
    }else{
        tripId = urlObject["leg"+(parseInt(urlObject.leg)+1)];
    }
    tripId = tripId.replace(/\%20/g,"");
    if(!flights[id][tripId]){
        flights[id][tripId] = [];
    }
    // var regex = new RegExp("+", "g");

    flights[id][tripId].push(req.body.data);
    console.log("Data : \n\n",util.inspect(flights));
    console.log("\n\nRegion : \n\n",util.inspect(region));
    res.send(true);
});

router.post('/extLogin',function(req,res){
    var email = req.body.email;
    var password = req.body.password;

    User.findOne({ 'local.email' :  email }, function(err, user) {
        // if there are any errors, return the error
        if (err)
            return res.send(false);

        // if no user is found, return the message
        if (!user)
            return res.send(false);

        if (!user.validPassword(password))
            return res.send(false);

        // all is well, return user
        else
            return res.send(user.local.ExtId);
    });
});

router.get('/list',isLoggedIn,function(req,res){
    var id = req.user.local.ExtId;
    console.log("User : \n\n",util.inspect(req.user));
    console.log("Data : \n\n",util.inspect(data));
    console.log("Data_ID : \n\n",util.inspect(data[id]));

    console.log("\n\nRegion : \n\n",util.inspect(region));
    res.render('list',{data:data[id],region:region,flight:flights[id],id:id});
});

router.get('/add',isLoggedIn,function(req,res){
    var id = req.user.local.ExtId;
    var sharedId = req.query.id;
    var items = req.query;
    delete items.id;
    if(sharedId){
        for(key in items){
            var info = items[key].split("->");
            if(info[0]=="flights"){
                if(!flights[id]){
                    flights[id] = {};
                }
                if(!flights[id][info[1]]){
                    flights[id][info[1]] = [];
                }
                flights[id][info[1]].push(flights[sharedId][info[1]][info[2]]);
            }
            if(info[0]=="data"){
                if(!data[id]){
                    data[id] = {};
                }
                if(!data[id][info[1]]){
                    data[id][info[1]] = {};
                }
                data[id][info[1]][info[2]] = data[sharedId][info[1]][info[2]];
            }
        }
    }
    res.redirect('/list');
});


module.exports = router;
