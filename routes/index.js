var express = require('express');
var mongodb = require('../models/db.js');
var crypto = require('crypto'),
    User = require('../models/user.js'),
    Commodity = require('../models/commodity.js'),
    Order = require('../models/order.js'),
    ObjectID = require('mongodb').ObjectID;

module.exports = function(app){

	app.get('/', function(req, res, next) {
		/* GET home page. */
		Commodity.getByQuery({trade: 0}, 'createTime', -1, 12, function(err, commodities){
			if(err){
				req.flash('error', err);
			}
			res.render('index', {
				title: '首页',
				user: req.session.user,
				commodities: commodities,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
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
	});

	app.post('/login', checkNotLogin);
	app.post('/login', function(req, res, next){
		var phoneNumber = req.body.phoneNumber,
			password = req.body.password;

		var md5 = crypto.createHash('md5');
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
		var md5 = crypto.createHash('md5');
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
	});

	//用户中心
	app.get('/user-center', checkLogin);
	app.get('/user-center', function(req, res, next){

		//取得个人订单
		Order.getByQuery({'buyer': req.session.user.phoneNumber}, 'createTime', -1, null, function(err, orders){
			if(err){
				req.flash('error', err);
			}
			console.log(orders);
			res.render('user-center', {
				title:'用户中心',
				orders: orders,
				user:req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

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

	//取得个人商品
	app.get('/my-commodities', checkLogin);
	app.get('/my-commodities', function(req, res, next){
		Commodity.getByQuery({'owner': req.session.user.phoneNumber}, 'createTime', -1, null, function(err, commodities){
			if(err){
				req.flash('error', err);
			}
			res.render('my-commodities',{
				title:'我的商品',
				user:req.session.user,
				commodities: commodities,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	//个人信息
	app.get('/user-info', checkLogin);
	app.get('/user-info', function(req, res, next){
		res.render('user-info',{
			title:'个人资料',
			user:req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	//商品详情
	app.get('/item', function(req, res, next){
		console.log(req.query.id);
		Commodity.getOne(req.query.id, function(err, commodity){
			if(err){
				req.flash('error',err);
			}
			res.render('item',{
				title: commodity.name + '-商品详情',
				commodity: commodity,
				user:req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	//查看购物车
	app.get('/cart', checkLogin);
	app.get('/cart', function(req, res, next){
		User.get(req.session.user.phoneNumber, function(err, user){
			if(err){
				req.flash('error',err);
			}
			var sum = 0;
			user.cart.forEach(function(commodity, index){
				sum+= commodity[2]*commodity[3];
			});
			res.render('cart',{
				title: '我的购物车',
				user: user,
				sum: sum,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	//添加到购物车
	app.post('/cart', checkLogin);
	app.post('/cart', function(req, res, next){
		if(req.body.num >= 0){
			Commodity.getOne(req.query.id, function(err, commodity){
				if(err){
					req.flash('error',err);
				}
				User.get(req.session.user.phoneNumber, function(err, user){
					if(err){
						req.flash('error',err);
					}
					var index;
					user.cart.forEach(function(e, i){
						if(e[0] == req.query.id){index = i;}
					});
					//console.log(index);
					if(index !== undefined){
						console.log("增加商品数量！",index,req.body.num);
						User.changeCommodityNum(req.session.user.phoneNumber, index, Number(req.body.num), function(err, user){
							if(err){
								req.flash('error',err);
							}
							req.flash('success','商品添加成功！');
							res.redirect('back');
						});
					}else{
						console.log("增加新产品！");
						User.addCommodity(req.session.user.phoneNumber, req.query.id, commodity.name, req.body.num, commodity.price, commodity.oldPrice, commodity.owner, function(err, user){
							if(err){
								req.flash('error',err);
							}
							req.flash('success','商品添加成功！');
							res.redirect('back');
						});
					}
				});
				
			});
		}
	});

	//订单详情页
	app.get('/order', checkLogin);
	app.get('/order', function(req, res, next){

		//提交订单
		if(req.query.op === 'submit'){

			//创建订单
			User.get(req.session.user.phoneNumber,function(err, user){

				var order = {
					createTime: new Date(),
					status: 0,
					buyer: req.session.user.phoneNumber,
					goods: user.cart
				};

				var newOrder = new Order(order);
				newOrder.save(function(err, order){
					if(err){
						req.flash('error', err);
					}

					console.log('生成订单成功！');
					//修改库存

					//打开数据库
					mongodb.open(function(err, db){
						if(err){
							mongodb.close();
							return req.flash('error', err);
						}

						console.log('打开数据库成功！');

						//读取商品集合
						db.collection('commodities', function(err, collection){
							if(err){
								return req.flash('error', err);
							}

							console.log('读取商品集合成功！');
							console.log(order[0].goods);

							order[0].goods.forEach(function(e, i, a){
								console.log('正在处理第'+i+1+'个商品。');
								collection.update({'_id': new ObjectID(e[0])}, {'$inc': {'inventory': -e[2]}}, function(err, commodity){
									console.log('Commodity edit success.');
									mongodb.close();
								});
							});

							console.log('修改库存成功！');
											
							//清空购物车
							User.clearCart(req.session.user.phoneNumber, function(err, user){
								if(err){
									console.log(err);
									req.flash('error', err);
								}
								req.flash('success','订单提交成功！');
								res.redirect('back');
							});
						});
					});
				});
			});
		}
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
};