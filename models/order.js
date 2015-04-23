var mongodb = require('./db');

function Order(order){
	this.createTime = order.createTime;
	this.goods = order.goods;
	this.buyer = order.buyer;
	this.status = order.status;
}

module.exports = Order;

//存储订单信息
User.prototype.save = function(callback){

    //要存入订单的数据文档
    var user = {
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