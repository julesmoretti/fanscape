//  middleware.js

//  set up ======================================================================
var favicon         = require('serve-favicon'),
    bodyParser      = require('body-parser'),
    morgan          = require('morgan'),
    sass            = require('node-sass');


  module.exports    = function(app){

//  sass css generator ==========================================================
    sass.renderFile({
      file: './views/css/style.scss',
      success: function(css) {
        // console.log(css);
        console.log('style.css overwritten');
      },
      error: function(error) {
        console.log(error);
      },
      includePaths: ['views/css'],
      // outputStyle: 'compressed',
      outFile: './views/css/style.css'
    });

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