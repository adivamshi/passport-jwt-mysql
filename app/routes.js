'use strict'
// Import dependencies
var passport = require('passport');
var express = require('express');
var config = require('../config/main');
var jwt = require('jsonwebtoken');
var crypt = require('../app/crypt');
var db = require('./db');
// Set up middleware
var requireAuth = passport.authenticate('jwt', {session: false});

// Export the routes for our app to use
module.exports = function (app) {
    // API Route Section

    // Initialize passport for use
    app.use(passport.initialize());

    // Bring in defined Passport Strategy
    require('../config/passport')(passport);

    // Create API group routes
    var apiRoutes = express.Router();

    // Register new users
    apiRoutes.post('/register', function (request, response) {
        console.log(request.body);
        if (!request.body.email || !request.body.password) {
            response.status(400).json({success: false, message: 'Please enter email and password.'});
        } else {
            var newUser = {
                email: request.body.email,
                password: request.body.password
            };

            // Attempt to save the user
            db.createUser(newUser, function (res) {
                response.status(201).json({success: true, message: 'Successfully created new user.'});
            }, function (err) {
                return response.status(400).json({success: false, message: 'That email address already exists.'});
            });
        }
    });

    // Authenticate the user and get a JSON Web Token to include in the header of future requests.
    apiRoutes.post('/authenticate', function (request, response) {
        db.findUser({
            email: request.body.email
        }, function (res) {
            var user = {
                user_id: res.user_id,
                user_email: res.user_email,
                is_active: res.is_active,
                user_type: res.user_type
            };

            // Check if password matches
            crypt.compareHash(request.body.password, res.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // Create token if the password matched and no error was thrown
                    var token = jwt.sign(user, config.secret, {
                        expiresIn: 10080 // in seconds
                    });
                    response.status(200).json({success: true, token: 'JWT ' + token});
                } else {
                    response.status(401).json({
                        success: false,
                        message: 'Authentication failed. Passwords did not match.'
                    });
                }
            });
        }, function (err) {
            response.status(401).json({success: false, message: 'Authentication failed. User not found.'});
        });
    });

    //Protected authenticated route with JWT
    apiRoutes.get('/dashboard', requireAuth, function (request, response) {
        response.send('It worked User id is: ' + request.user.user_id + ', Email id is: ' + request.user.user_email + '.');
    });

    // Set url for API group routes
    app.use('/api', apiRoutes);
};
