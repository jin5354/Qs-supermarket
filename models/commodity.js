var mongodb = require('./db');

function Commodity(commodity){
	this.owner = commodity.owner;
	this.createTime = commodity.createTime;
	this.name = commodity.name;
	this.price = commodity.price;
	this.oldPrice = commodity.oldPrice;
	this.description = commodity.description;
	this.inventory = commodity.inventory;
	this.fineness = commodity.fineness;
	this.trade = commodity.trade;
	this.cate = commodity.cate
}

/*
	trade: 	0 - onsale
			1 - selling
			2 - saleout
*/

module.exports = Commodity;

//存储商品信息
Commodity.prototype.save = function(callback){

	//要存入商品的数据文档
	var commodity = {
		owner: this.owner,
		createTime: this.createTime,
		name: this.name,
		price: this.price,
		oldPrice: this.oldPrice,
		description: this.description,
		inventory: this.inventory,
		fineness: this.fineness,
		trade: this.trade,
		cate: this.cate
	}

	//打开数据库
	mongodb.open(function(err,db){
		if(err){return callback(err);}

		//读取Commodities集合
		db.collection('commodities',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//将商品数据存入
			collection.insert(commodity,{safe:true},function(err,user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,user[0]);
			});
		});
	});
}

//读取商品信息
Commodity.get = function(id,callback){

	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}

		//读取Commodities集合
		db.collection('commodities', function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//查找商品
			collection.findOne({id: id},function(err,user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,user);
			});
		});
	});
};

//按条件查询商品
Commodity.getByQuery = function(key, order, limitNum, callback){

	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}

		//读取Commodities集合
		db.collection('commodities', function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			var oSort = {};
			oSort[key] = order;

			//查找商品
			collection.find().sort(oSort).limit(limitNum).toArray(function(err, docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				console.log('success.');
				callback(null, docs);
			});
		});
	});
}