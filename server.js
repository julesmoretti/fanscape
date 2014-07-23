// server.js

// set up ======================================================================
var express           = require('express');
var app               = express();
var favicon           = require('serve-favicon');
var port              = process.env.PORT || 3000;
var morgan            = require('morgan');
var bodyParser        = require('body-parser');

// configuration ===============================================================
app.use(favicon(__dirname + '/views/img/favicon.ico', { maxAge: 500 }));
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json()); // get information from html forms
// app.use(bodyParser()); //Now deprecated
app.use(bodyParser.urlencoded({
  extended: true
})); // get information from html forms
app.use(express.static('.'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs'); // set up ejs for templating

// routes ======================================================================
require(__dirname + '/app/routes.js')(app); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
