var express = require('express');
var crypto = require('crypto'),
    User = require('../models/user.js'),
    Commodity = require('../models/commodity.js');

module.exports = function(app){

	app.get('/', function(req, res, next) {
		/* GET home page. */
		Commodity.getByQuery('createTime', 1, 12, function(err, docs){
			if(err){
				req.flash('error', err);
				return res.redirect('/');
			}
			console.log(docs.length);
		});

		res.render('index', {
			title: '首页',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	//登录
	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res, next){
		res.render('login',{
			title: '登录',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	})

	app.post('/login', checkNotLogin);
	app.post('/login', function(req, res, next){
		var phoneNumber = req.body.phoneNumber,
			password = req.body.password;

		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');

		User.get(phoneNumber, function(err, user){

			//检查用户是否存在
			if(!user){
				req.flash('error', '用户不存在！');
				return res.redirect('/login');
			}
			//核对密码
			if(user.password !== password){
				req.flash('error', '密码错误！');
				return res.redirect('/login');
			}
			//匹配后将用户信息存入session
			req.session.user = user;
			req.flash('success', '登录成功！');
			res.redirect('/');
		});

	});

	//注册
	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res, next){
		res.render('reg',{
			title: '注册',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.post('/reg', checkNotLogin);
	app.post('/reg', function(req, res){
		var phoneNumber = req.body.phoneNumber,
			password = req.body.password,
			rePassword = req.body.rePassword,
			nickName = req.body.nickName;
		
		//表单验证
		if(password !== rePassword){
			req.flash('error', '两次输入的密码不一致！');
			return res.redirect('/reg');
		}

		//生成密码的md5值
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');
		var newUser = new User({
			phoneNumber: phoneNumber,
			password: password,
			nickName: nickName
		});

		//检查用户名是否存在
		User.get(newUser.phoneNumber, function(err, user){
			if(err){
				req.flash('error', err);
				return res.redirect('/');
			}
			if(user){
				req.flash('error', '用户已存在！');
				return res.redirect('/reg');
			}else{
				//如果不存在则增加新用户
				newUser.save(function(err,user){
					if(err){
						req.flash('error', err);
						return res.redirect('/');
					}
					req.session.user = user;
					req.flash('success', '成功注册！');
					res.redirect('/');
				});
			}
		});
	});

	//注销
	app.get('/logout', checkLogin);
	app.get('/logout', function(req, res, next){
		req.session.user = null;
		req.flash('success', '成功退出！');
		res.redirect('/');
	})

	//用户中心
	app.get('/user-center', checkLogin);
	app.get('/user-center', function(req, res, next){
		res.render('user-center', {
			title:'用户中心',
			user:req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	})

	//上传商品信息
	app.get('/upload-commodity', checkLogin);
	app.get('/upload-commodity', function(req, res, next){
		res.render('upload-commodity',{
			title:'用户中心',
			user:req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	app.post('/upload-commodity', checkLogin);
	app.post('/upload-commodity', function(req, res, next){
		var newCommodity = new Commodity({
			owner: req.session.user.phoneNumber,
			createTime: new Date(),
			name: req.body.name,
			price: req.body.price,
			oldPrice: req.body.oldPrice,
			inventory: req.body.inventory,
			fineness: req.body.fineness,
			trade: 0,
			cate: req.body.cate,
			description: req.body.description
		});

		newCommodity.save(function(err, commodity){
			if(err){
				req.flash('error', err);
				res.redirect('/upload-commodity');
			}
			req.flash('success', '商品成功发布！');
			res.redirect('/user-center');
		});
	});

	//检查是否为登录状态，未登录则跳转登录
	function checkLogin(req,res,next){
		if(!req.session.user){
			req.flash('error', '请先登录！');
			return res.redirect('/login');
		}
		next();
	}

	//检查是否为登录状态，登录了则跳回首页
	function checkNotLogin(req,res,next){
		if(req.session.user){
			req.flash('error', '您已登录，请先退出再执行相应操作！');
			return res.redirect('/');
		}
		next();
	}
}
