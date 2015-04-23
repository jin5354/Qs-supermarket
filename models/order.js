var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Order(order){
	this.createTime = order.createTime;
	this.goods = order.goods;
	this.buyer = order.buyer;
	this.status = order.status;
}

module.exports = Order;

//存储订单信息
Order.prototype.save = function(callback){

    //要存入订单的数据文档
    var order = {
        createTime: this.createTime,
        goods: this.goods,
        buyer: this.buyer,
        status: this.status
    };

    //打开数据库
    mongodb.open(function(err,db){
        if(err){return callback(err);}

        //读取订单集合
        db.collection('orders',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            //将订单数据存入
            collection.insert(order,{safe:true},function(err,order){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,order);
            });
        });
    });
};

//读取订单信息
Order.get = function(_id,callback){

    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            mongodb.close();
            return callback(err);
        }

        //读取orders集合
        db.collection('orders', function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            //查找用户
            collection.findOne({"_id": new ObjectID(_id)},function(err,order){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,order);
            });
        });
    });
};

//查询订单
Order.getByQuery = function(oFind, sortKey, order, limitNum, callback){

    //打开数据库
    mongodb.open(function(err, db){
        if(err){
            mongodb.close();
            return callback(err);
        }

        //读取订单集合
        db.collection('orders', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            var oSort = {};
            if(sortKey){
                oSort[sortKey] = order;
            }

            //获取查询结果
            collection.find(oFind).sort(oSort).limit(limitNum).toArray(function(err, docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                console.log('Order getByQuery success.', oFind, sortKey, order, limitNum, 'length:'+docs.length);
                callback(null, docs);
            });
        });
    });
}