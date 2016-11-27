'use strict';
// Include our packages in our main server file
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var config = require('./config/main');
var cors = require('cors');
var port = 8080;

// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

// Log requests to console
app.use(morgan('dev'));

// Home route. We'll end up changing this to our main front end index later.
app.get('/', function (req, res) {
    res.send('This Route is not yet defined.');
});

require('./app/routes')(app);

// Start the server
app.listen(port);
console.log('Your server is running on port ' + port + '.');
