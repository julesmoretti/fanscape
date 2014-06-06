var express = require('express');  // insert express


module.exports = {
  '/': {
    'get': function (req, res) {
      res.send(200, 'Hello world!');
    }
  }
};