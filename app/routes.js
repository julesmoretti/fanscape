//  app/routes.js

//  set up ======================================================================
var instagramUtils  = require('./instagramUtils.js');


//  routes ======================================================================
  module.exports    = function(app, passport) {

    // landing page to site loads default - login.ejs
    app.get('/', instagramUtils.loadPage);

    // sends users to instagram to be authenticated
    app.get('/authorize_user', instagramUtils.authorize_user);

    // reads from instagram authentication data and records it
    app.get('/auth/instagram/callback', instagramUtils.handleauth);

    // start the process of gathering data
    app.get('/globe', instagramUtils.fetchAllMedia);

    // 404 not found error page
    app.get('/404/', function(req, res){
      res.render('./partials/404.ejs');
    });

    // send any unknown to the 404 page!
    app.get('*', function(req, res){
      res.redirect('./404/');
    });

  };
