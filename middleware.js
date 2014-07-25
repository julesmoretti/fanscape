//  middleware.js

//  set up ======================================================================
var favicon         = require('serve-favicon'),
    bodyParser      = require('body-parser'),
    morgan          = require('morgan');


  module.exports    = function(app){

//  loading standard middleware =================================================
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));

//  favicon directive ===========================================================
    app.use(favicon('./views/img/favicon.ico', { maxAge: 500 }));

//  logger for development ======================================================
    app.use(morgan('dev')); // log every request to the console

//  html rendering engine =======================================================
    app.set('views', './views');
    app.set('view engine', 'ejs');

  };