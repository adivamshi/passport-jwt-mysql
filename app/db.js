'use strict';
var mysql = require('mysql');
var crypt = require('./crypt');
var config = require('../config/main');
var db = {};
// Creating a connection object for connecting to mysql database
var connection = mysql.createConnection({
    host: config.database_host,
    port: config.database_port,
    user: config.database_user,
    password: config.database_password,
    database: config.database_name
});

//Connecting to database
connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

db.createUser = function (user, successCallback, failureCallback) {
    var passwordHash;
    crypt.createHash(user.password, function (res) {
        passwordHash = res;
        connection.query("INSERT INTO `passport-auth`.`users` (`user_email`, `password`) VALUES ('" + user.email + "', '" + passwordHash + "');",
            function (err, rows, fields, res) {
                if (err) {
                    failureCallback(err);
                    return;
                }
                successCallback();
            });
    }, function (err) {
        failureCallback();
    });
};

db.findUser = function (user, successCallback, failureCallback) {
    var sqlQuery = "SELECT * FROM `passport-auth`.users WHERE `user_email` = '" + user.email + "';";
    connection.query(sqlQuery, function (err, rows, fields, res) {
        if (err) {
            failureCallback(err);
            return;
        }
        if (rows.length > 0) {
            successCallback(rows[0])
        } else {
            failureCallback('User not found.');
        }
    });
};

module.exports = db;