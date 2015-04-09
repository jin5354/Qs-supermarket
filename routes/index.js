var express = require('express');
var crypto = require('crypto'),
    User = require('../models/user.js');

module.exports = function(app){
	app.get('/', function(req, res, next) {
		/* GET home page. */
		res.render('index', { title: 'Express' });
	});

	app.get('/login', function(req, res, next){
		res.render('login');
	})

	app.get('/reg', function(req, res, next){
		res.render('reg');
	})
	app.post('/reg', function(req, res){
		console.log(req.body);
	})
}
