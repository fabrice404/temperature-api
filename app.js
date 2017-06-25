const config = require('./config'),
  express = require('express'),
  mongoose = require('mongoose'),
  app = express(),
  bodyParser = require('body-parser'),
  cron = require('./api/cron'),
  routes = require('./api/routes'),
  measure = require('./api/model');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

routes(app);

app.listen(config.express.port, () => console.log("Server is listening on port " + config.express.port));
