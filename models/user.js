var mongodb = require('./db');

function User(user){
	this.phoneNumber = user.phoneNumber;
	this.password = user.password;
	this.nickName = user.nickName;
	this.cart = [];
}

module.exports = User;

//存储用户信息
User.prototype.save = function(callback){

	//要存入用户的数据文档
	var user = {
		phoneNumber: this.phoneNumber,
		password: this.password,
		nickName: this.nickName,
		cart: this.cart
	};

	//打开数据库
	mongodb.open(function(err,db){
		if(err){return callback(err);}

		//读取users集合
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//将用户数据存入
			collection.insert(user,{safe:true},function(err,user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,user[0]);
			});
		});
	});
};

//读取用户信息
User.get = function(phoneNumber,callback){

	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}

		//读取users集合
		db.collection('users', function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//查找用户
			collection.findOne({phoneNumber: phoneNumber},function(err,user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,user);
			});
		});
	});
};

//添加商品到购物车
User.addCommodity = function(phoneNumber, _id, name, num, price, oldprice, owner, callback){

	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}

		//读取users集合
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//更新user
			collection.update({phoneNumber: phoneNumber}, {"$push":{"cart":[_id, name, Number(num), Number(price), Number(oldprice), owner]}},function(err,user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,user);
			});
		});
	});
};

//修改购物车内商品数量
User.changeCommodityNum = function(phoneNumber, index, num, callback){

	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}

		//读取users集合
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//更新user
			var string = "cart."+index+".2";
			var obj = {};
			obj[string] = num;
			console.log(obj);
			collection.update({phoneNumber: phoneNumber}, {"$inc": obj},function(err,user){
				console.log(err);
				console.log("增加成功！",phoneNumber,index,num);
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,user);
			});
		});
	});
};

//清空购物车
User.clearCart = function(phoneNumber, callback){
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}

		//读取users集合
		db.collection('users', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//更新user
			collection.update({phoneNumber: phoneNumber}, {"$set": {'cart':[]}},function(err,user){
				console.log(err);
				console.log("清空成功！",phoneNumber);
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,user);
			});
		});
	});
};