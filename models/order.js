var mongodb = require('./db');

function Order(order){
	this.createTime = order.createTime;
	this.goods = order.goods;
	this.buyer = order.buyer;
	this.status = order.status;
	this.price = order.price;
	this.id = order.id;
}