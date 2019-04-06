var Product = require('../models/product');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
//mongoose.connect(process.env.MONGODB_URI);
mongoose.connect('localhost:27017/shopping');

var products = [
	new Product({
	imagePath: 'https://i.ytimg.com/vi/k6LebeDlOkA/maxresdefault.jpg',
	title: 'One Plus 5',
	description: 'Smartphone with upto 8 GB of RAM.Super camera and gadget',
	price: 35000}),
	new Product({
	imagePath: 'https://store.storeimages.cdn-apple.com/4974/as-images.apple.com/is/image/AppleInc/aos/published/images/i/ph/iphone7/plus/iphone7-plus-gold-select-2016?wid=300&hei=300&fmt=png-alpha&qlt=95&.v=1472430108712',
	title: 'i-Phone 7S Plus',
	description: 'Here a box with all you want from Apple Inc',
	price: 72000}),
	new Product({
	imagePath: 'http://www.andho.com/wp-content/uploads/2017/01/Oppo-R9S.jpg',
	title: 'Oppo',
	description: 'Oppo Upcoming.Go prebook it!!!!!',
	price: 19999}),
	new Product({
	imagePath: 'https://dlbgadget-sinfosoft.netdna-ssl.com/wp-content/uploads/2016/12/Gionee-S9-1.jpg',
	title: 'Gionee SellfieSthan',
	description: 'Here is your SellfieSthan',
	price: 21599}),
	new Product({
	imagePath: 'http://images.deccanchronicle.com/dc-Cover-3t5eu7luhi8225ccbt7tr4j1s3-20170323125058.Medi.jpeg',
	title: 'Latest Lava Box',
	description: 'With most desi avatar',
	price: 12000}),
	new Product({
	imagePath: 'http://images.fonearena.com/blog/wp-content/uploads/2016/05/micromax-canvas-6-gold-fonearena-2.jpg',
	title: 'Micromax with you',
	description: 'Devil is Here.Just own it',
	price: 16899}),
	new Product({
	imagePath: 'http://asianetindia.com/wp-content/uploads/2012/11/Lenovo-smartphones.jpg',
	title: 'Intel Inside',
	description: 'Cool and most advanced super gazetted mobile phone',
	price: 19000}),
	new Product({
	imagePath: 'http://www3.lenovo.com/medias/lenovo-smartphone-Vibe-p1m-front-back-list.png?context=bWFzdGVyfHJvb3R8MjczOTB8aW1hZ2UvcG5nfGg2Zi9oMWMvOTM0OTEyODYxODAxNC5wbmd8ZDAwMjU0ODk4ZjlkZWFiYzAwN2VkNzg3MTU0MjA3MzU0ZGM5NWEwNzI2MDYwMGVkN2VhZTVmNmU5ZDZiMjg1ZQ',
	title: 'Lenovo Vibe',
	description: 'A Lenovo Product',
	price: 9999}),
	new Product({
	imagePath: 'http://www.gizbot.com/img/2017/01/everythingaboutthenewlylaunchednokia6-image-08-1483858286.jpg',
	title: 'Nokia Bang Bang ',
	description: 'A banger from the old pie Nokia',
	price: 8999}),
	new Product({
	imagePath: 'http://static.dnaindia.com/sites/default/files/styles/half/public/2015/08/18/366759-eluga-i21.jpg?itok=7bBKl7QY',
	title: 'Panasonic Eluga',
	description: 'Elegance from Panasonic',
	price: 12999}),
	new Product({
	imagePath: 'http://st1.bgr.in/wp-content/uploads/2014/06/android-smartphone.jpg',
	title: 'Android Kitkat',
	description: 'A device from the Android OS designer',
	price: 7599}),
	new Product({
	imagePath: 'http://www.infocusindia.co.in/images/bingo21.jpg',
	title: 'InFocus',
	description: 'Focus your stuff with InFocus Phone',
	price: 8499}),
];


var done = 0;
for (var i=0; i<products.length; i++){
	products[i].save(function(err, data){
		done++;
		if (done === products.length){
			exit();
		}
	});
}

function exit(){
	mongoose.disconnect();
}