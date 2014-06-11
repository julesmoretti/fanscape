// app/routes.js
// set up ======================================================================
var instagramUtils = require('./instagramUtils.js');

// exports.route = route;
module.exports = function(app, passport) {
  app.get('/', instagramUtils.loadPage);
  // app.get('/username', instagramUtils.userName);
  app.get('/globe', instagramUtils.fetchAllMedia);

  // This is where you would initially send users to authorize
  app.get('/authorize_user', instagramUtils.authorize_user);

  // This is your redirect URI
  app.get('/auth/instagram/callback', instagramUtils.handleauth);
};
