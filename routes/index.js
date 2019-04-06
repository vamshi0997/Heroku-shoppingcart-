var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Cart = require('../models/cart');
var Order = require('../models/order');


/* GET home page. */
router.get('/', function(req, rep, next) {
	var products = Product.find(function(err, data){
		handle_product_landing(err, req, rep, data);
	});
});


/* Product search API */
router.get('/search/:query', function(req, rep, next){
	var _query = req.params.query;
	if (_query) {
       const regex = new RegExp(escapeRegex(_query), 'gi');
       Product.find({ 
       		"$or": [{
        		"title": regex
    			}, {
        		"description": regex
    		}]
            }, 
       		function(err, data){
         		handle_product_landing(err, req, rep, data);
         	}); 
    }
    else{
    	return rep.redirect('/')
    }
});


router.get('/add-to-cart/:id', function(req, rep, next){
	var productId = req.params.id;
	var cart = new Cart(req.session.cart? req.session.cart: {});

	Product.findById(productId, function(err, product){
		if (err){
			return rep.redirect('/');
		}
		cart.add(product, product.id);
		req.session.cart = cart;
		//console.log(req.session.cart);
		rep.redirect('/');
	});
});


router.get('/reduce/:id', function(req, rep, next){
	var productId = req.params.id;
	var cart = new Cart(req.session.cart? req.session.cart: {});
	cart.reduceByOne(productId);
	req.session.cart = cart;

	return rep.redirect('/shopping-cart');
});


router.get('/remove/:id', function(req, rep, next){
	var productId = req.params.id;
	var cart = new Cart(req.session.cart? req.session.cart: {});
	cart.removeItem(productId);
	req.session.cart = cart;

	return rep.redirect('/shopping-cart');
});

router.get('/shopping-cart', loginRequired, function(req, rep, next){
	if (!req.session.cart){
		//console.log('handling no items in cart');
		return rep.render('shop/shopping-cart', {products:null})
	}
	var cart = new Cart(req.session.cart);
	return rep.render('shop/shopping-cart', {products:cart.generateArray(), totalPrice: cart.totalPrice});
});


router.get('/checkout', function(req, rep, next){
	if (!req.session.cart){
		//console.log('handling no items in cart');
		return rep.redirect('/shopping-cart')
	}
	var cart = new Cart(req.session.cart);
	var errMsg = req.flash('error')[0];
	rep.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noErrors: !errMsg});
});


router.post('/checkout', loginRequired, function(req, rep, next){
	if (!req.session.cart){
		//console.log('handling no items in cart');
		return rep.redirect('/shopping-cart')
	}

	var cart = new Cart(req.session.cart);
	var stripe = require("stripe")(
  		"sk_test_pJyz61oy4yINK6u7rk46qmIF"
	);

	stripe.charges.create({
  		amount: cart.totalPrice * 100,
  		currency: "usd",
  		source: req.body.stripeToken, // obtained with Stripe.js
  		description: "Charge for node-shopkart purchase"
		}, 
		function(err, charge) {
  			// asynchronously called
  			if(err) {
  				req.flash('error', err.message);
  				return rep.redirect('/checkout');
  			}
  			var order = new Order({
  				user: req.user,
  				cart: cart,
  				address: req.body.address,
  				name: req.body.name,
  				paymentId: charge.id
  			});
  			order.save(function(err, result){
	  			req.flash('success', 'Successfully bought the cart item/s');
	  			req.session.cart =  null;
	  			rep.redirect('/');
  			});
		});
});


module.exports = router;


function loginRequired(req, rep, next){
	if (req.isAuthenticated()){
		return next();
	}
	req.session.oldUrl = req.url;
	rep.redirect('/user/signin');
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function handle_product_landing(err, req, rep, data){
	if (!err){	
		var successMsg = req.flash('success')[0];
		var  productsChunk = [];
		var chunkSize = 3;
		for (var i = 0; i <= data.length; i += chunkSize ){
			productsChunk.push(data.slice(i, i + chunkSize));
		}

		rep.render('shop/index',
			{ 
				title: 'Grab Mobiles Online', 
				products: productsChunk, 
				successMsg: successMsg, 
				noMessage: !successMsg
			}
		);
	}
	else{
		console.error(err);
	}	
}
