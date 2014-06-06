// server.js

// set up ======================================================================
// get all the tools we need
// var http            = require("http");
// var url             = require("url");
var express           = require('express');
var app               = express();
var everyauth         = require('./utils.js');
var everyauthRoot     = __dirname + '/..';
var port              = process.env.PORT || 3000;
var passport          = require('passport');
var InstagramStrategy = require('passport-instagram').Strategy;

var morgan            = require('morgan');
var ig                = require('instagram-node').instagram();
var bodyParser        = require('body-parser');
var Firebase          = require('firebase');
// var flash           = require('connect-flash');
// var _               = require('underscore');
// var async           = require('async');

// var utils             = require('./app/utils');
// var handleRequest   = require("./request-handler.js").handler;

// // configuration ===============================================================

app.use(morgan('dev')); // log every request to the console
app.use(bodyParser()); // get information from html forms
app.set('view engine', 'ejs'); // set up ejs for templating
// app.use(express.cookieParser()); // read cookies (needed for auth)

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport



// everyauth integrations ======================================================
// var express = require('express')
  // , everyauth = require('../index')
//   // , everyauthRoot = __dirname + '/..';

// everyauth.debug = true;

// var usersById = {};
// var nextUserId = 0;

// function addUser (source, sourceUser) {
//   var user;
//   if (arguments.length === 1) { // password-based
//     user = sourceUser = source;
//     user.id = ++nextUserId;
//     return usersById[nextUserId] = user;
//   } else { // non-password-based
//     user = usersById[++nextUserId] = {id: nextUserId};
//     user[source] = sourceUser;
//   }
//   return user;
// }

// var usersByInstagramId = {};

// everyauth.everymodule
//   .findUserById( function (id, callback) {
//     callback(null, usersById[id]);
//   });

// everyauth.instagram
//   .appId('a1a66b75bb924ce3b35151247480cbbc')
//   .appSecret('73e163c1cfa14442b9403b5f6adf9a63')
//   .scope('basic')
//   .findOrCreateUser( function (sess, accessToken, accessTokenExtra, hipster) {
//       return usersByInstagramId[hipster.id] || (usersByInstagramId[hipster.id] = addUser('instagram', hipster));
//   })
//   .redirectPath('/');


// var app = express();
// app.use(express.static(__dirname + '/public'))
//   .use(express.favicon())
//   .use(express.bodyParser())
//   .use(express.cookieParser('htuayreve'))
//   .use(express.session())
//   .use(everyauth.middleware());

// app.configure( function () {
//   app.set('view engine', 'jade');
//   app.set('views', everyauthRoot + '/example/views');
// });

// app.get('/', function (req, res) {
//   res.render('home');
// });









// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
app.use(express.static('.'));

// added =======================================================================
// module.exports = app;  /// ADDED