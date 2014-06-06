// app/routes.js
// set up ======================================================================
var express = require('express');  // insert express
var instagramUtils = require('./instagramUtils.js');

// exports.route = route;
module.exports = function(app, passport) {
  app.get('/', instagramUtils.loadPage);
  app.get('/globe', instagramUtils.fetchAllMedia);
  // app.get('/globe', instagramUtils.temp);
};