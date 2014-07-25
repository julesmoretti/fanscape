//  server.js

//  set up ======================================================================
var port            = process.env.PORT || 3000,
    express         = require('express'),
    app             = express();
    app.use(express.static('.'));

//  load middleware =============================================================
    require('./middleware.js')(app);

//  routes ======================================================================
var router = express.Router();
    require('./app/routes.js')(router);
    app.use(router);

//  launch ======================================================================
    app.listen(port);
    console.log('The magic happens on port ' + port);