var express        =      require("express");
var bodyParser     =      require("body-parser");
var app            =      express();
var redis           =     require("redis");
var mysql           =     require("mysql");
var session         =     require('express-session');
var redisStore      =     require('connect-redis')(session);
var Session      =     require('connect-mongo/es5')(session);
var cookieParser    =     require('cookie-parser');
var path            =     require("path");
var async           =     require("async");
var router          =     express.Router();
var Client      =   require('node-rest-client').Client;
var http            =   require('http');
var mysql   = require('mysql');
var client          =   redis.createClient(6379,"54.208.161.191");
var MongoClient = require('mongodb').MongoClient;
var assert  = require('assert');
var ObjectId    = require('mongodb').ObjectID;
var changeCase  =  require("change-case");
var url     = 'mongodb://ec2-52-200-66-11.compute-1.amazonaws.com:27017/rest_test';
var request = require('request');
var redisFailover = require('node-redis-failover');


function PutCode(url, data) {
    var opts = {
      method: 'PUT',
      uri: url,
      json: true,
      body: data
    }
    request(opts, function (err, resp, body) {
    })
}

//Failover code
var zookeeper = {
  servers: 'ec2-52-200-66-11.compute-1.amazonaws.com::2181',
  //chroot: '/appName'
};

var redis = redisFailover.createClient(zookeeper);

redis.on('ready', function() {
  // get the master client of 'node_1' (default master) 
  redis.getClient('node_1').ping(function(err, info) {
    console.log(info);
    client = redis.getClient('node_1','master');
  });

});

redis.on('change', function(name, state) {
  console.log('redis %s state changed, %j', name, state);
});

redis.on('masterChange', function(name, state) {
  client = redis.getClient('node_1','master');
  console.log('%s master changed, %s', name, state);
});





//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());
app.engine('html',require('ejs').renderFile);
app.set('views',path.join(__dirname ));
app.use(express.static(__dirname + '/public'));
var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
var server_host = process.env.YOUR_HOST || '0.0.0.0';

var pool    =   mysql.createPool({
    connectionLimit : 100,
    host     : 'ec2-52-200-66-11.compute-1.amazonaws.com',
    user     : 'root',
    password : 'root',
    database : 'redis_demo',
    debug    :  false
});

app.use(session({
        secret: 'ssshhhhh',
        store: new Session({url:'mongodb://ec2-52-200-66-11.compute-1.amazonaws.com:27017/rest_test', db: 'rest_test', collection: 'sessions'}),
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000,
        saveUninitialized: false,
        resave: false
}));



app.use(cookieParser("secretSign#143_!223"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//backend machine - var endpoint = "http://ec2-50-16-165-69.compute-1.amazonaws.com:8080/customers/"
var endpoint = "http://team5-elb-193492119.us-east-1.elb.amazonaws.com/customers/"

function handle_database(req,type,callback) {
    async.waterfall([
        function(callback) {
            pool.getConnection(function(err,connection){
                if(err) {
          // if there is error, stop right away.
          // This will stop the async code execution and goes to last function.
		    console.log(err);
                    callback(true);
                } else {
                    callback(null,connection);
                }
            });
        },
        function(connection,callback) {
            var SQLquery;
            console.log("i am in call back");
            switch(type) {
                case "login" :
                SQLquery = "SELECT * from user_login WHERE user_email='"+req.body.email+"' AND `user_password`='"+req.body.password+"'";
                console.log("selecting");
                break;
        case "checkEmail" :
        SQLquery = "SELECT * from user_login WHERE user_email='"+req.body.email+"'";
        break;
                case "register" :
                SQLquery = "INSERT into user_login(user_email,user_password,user_name) VALUES ('"+req.body.email+"','"+req.body.password+"','"+req.body.name+"')";
                break;
                case "addStatus" :
                SQLquery = "INSERT into user_status(user_id,user_status) VALUES ("+req.session.key["user_id"]+",'"+req.body.status+"')";
                break;
                case "getStatus" :
                SQLquery = "SELECT * FROM user_status WHERE user_id="+req.session.key["user_id"];
                break;
                default :
                break;
            }
            callback(null,connection,SQLquery);
        },
        function(connection,SQLquery,callback) {
            connection.query(SQLquery,function(err,rows){
        connection.release();
                if(!err) {
                    if(type === "login") {
                        callback(rows.length === 0 ? false : rows[0]);
                    } else if(type === "getStatus") {
            callback(rows.length === 0 ? false : rows);
          } else if(type === "checkEmail") {
            callback(rows.length === 0 ? false : true);
          }else {
                        callback(false);
                    }
                } else {
          // if there is error, stop right away.
          // This will stop the async code execution and goes to last function.
          callback(true);
        }
            });
        }
    ],function(result){
    // This function gets call after every async task finished.
        if(typeof(result) === "boolean" && result === true) {
            callback(null);
        } else {
            callback(result);
        }
    });
}


app.get('/',function(req,res){
	res.sendfile("index.html");
});

app.get('/index.html',function(req,res){
	res.sendfile("index.html");
})

app.post('/login.html',function(req,res){
    console.log("coming into post");
    handle_database(req, "login",function(response){
        if(response === null) {
            //res.json({"error" : "true","message" : "Database error occured"});
	    console.log("No response, case 1");
            res.redirect("/404.html");
        } else {
            if(!response) {
		console.log("No response, case 2");
                //res.json({"error" : "true","message" : "Login failed ! Please register"});
                res.redirect("/404.html");
            } else {
                
                console.log("Appending URL");
                var email =req.body.email
                var  url = endpoint+email
                var newString = '';
                var fullString = '';

                cart_callback = function(response) {
                        response.on('data', function(data) {
                                fullString += data.toString();
                        })
                        response.on('end', function() {
                            console.log("FULLSTRING : ",fullString);
                            newString = JSON.parse(fullString);
                            console.log(newString);
                            console.log(JSON.stringify(newString));
                            console.log(newString["cart"]);
                            console.log("***********************************");
                            console.log(newString["cart"]["cart_to_display"]);
                            // we want to have a fields called products to store mongo catalog and cart_to_display for everyone
                            var products = newString['products']
                            if (typeof products === "undefined") newString['products'] = {}
                            console.log(typeof req.session);
                            console.log(req.session);
                            //req.session = 'x9jCImbWhuis8DXALVHDtXiQrnQvlTMa';
                            req.session.key = newString;
                            res.redirect("/shop.html");
                            console.log("SESSION KEY is set to : ",req.session.key)
                            //res.json({"error" : false,"message" : "Login success."});
                    })
                }
                var x = http.get(url, cart_callback).end();


            }
        
        }
    });
});


app.get('/shop.html',function(req,res){
    res.render("shop.html",{email : req.session.key["name"]});
    console.log("email :", req.session.key["name"]);
});

app.post('/shop.html',function(req,res){
    app.set('data',req.body.varname);
    console.log("Setting choc name to ",req.body.varname);
    res.redirect("/product-details.html");
}); 

app.get('/product-details.html',function(req,res){
    console.log("chocolate name is ",app.get('data'));
    console.log("get request received", app.get('data'));
    var image_location = '' ;
    var price = '';
    var chocolatename = app.get('data');
    var id = '';
    MongoClient.connect(url,function(err,db){ 
        if(err){
            console.log("Unable to connect to the mongoDb server",err);
        } else {
                console.log("Connection established to db \n");
                var collection = db.collection('products');
                collection.find({name :chocolatename}).stream()
                .on('data',function(doc){
                    console.log("here");   
                    chocolatename = doc.name;
                    image_location = doc.location;
                    price = doc.price;
                    id = doc.productid;
                    console.log("doc:",doc);
                })
                .on('error',function(err){
                    console.log("error");
                })  
                .on('end', function(){
                    var count = 1;
                    console.log("image location set to ",image_location);
                    products = req.session.key["products"]
                    if (typeof products  === "undefined") {
                        req.session.key["products"] = {}
                    }
                    this_product = req.session.key["products"][chocolatename]
                    if (typeof this_product  === "undefined") {
                        req.session.key["products"][chocolatename] = {
                            'name': chocolatename,
                            'price': price,
                            'id': id,
                            'image': image_location,
                        }
                    }
                    res.render("product-details.ejs", { quantity:count,
                        chocolatename:chocolatename,
                        email:req.session.key["name"],
                        image:image_location,
                        price:price,id:id
                    });
            });
                           
          }
     });
});

app.post('/product-details.html',function(req,res){
	console.log("Posted in product-details");
    var product = new Object();
	product.name = req.body.postproduct;
	product.quantity = req.body.quantity;
	product.price = req.body.price;
	product.image = req.body.location;
    product.id = req.body.id;
	console.log("Build data object = ",product);
	console.log("chocolate name is ",req.body.postproduct);
    console.log("Printing cart :",req.session.key["cart"]);
    qty_in_redis = req.session.key["cart"]["items"][product.name];
    var new_qty = 0
    if(typeof qty_in_redis !== "undefined") {
        new_qty = parseInt(qty_in_redis) + parseInt(product.quantity);
        if (new_qty < 0) {
            new_qty = 0;
        }
    } else {
        new_qty = parseInt(product.quantity);
        if (new_qty < 0) {
            new_qty = 0;
        }
    }
    req.session.key["cart"]["items"][product.name] = new_qty;
	res.redirect("/cart.html");
});

app.get('/login.html',function(req,res){
    res.sendfile("login.html");
    //res.json({"error":true, "message":"test msg"});
    
});


app.get('/contact-us.html',function(req,res){
    res.sendfile("contact-us.html");
});


function search_in_list(items_in_cart_to_display, key) {
    for (var i=0; i<items_in_cart_to_display.length; i++) {
        if(items_in_cart_to_display[i]["name"] == key) {
            return items_in_cart_to_display[i];
        }
    }
}

app.get('/cart.html',function(req,res){
    console.log("in cart.html");
    var items_in_cart = req.session.key["cart"]["items"];
    var items_in_cart_to_display = req.session.key["cart"]["cart_to_display"];
    var products = req.session.key["products"];
    var total_price = 0.00;
    console.log(items_in_cart);
    console.log(items_in_cart_to_display);
    console.log(products);
    // Now create a datastructure containing several entries of
    // 1. name
    // 2. price
    // 3. qty
    // 4. id
    // 5. image
    // for each item in the cart. The frontend will use this to calculate
    // per product total and total product
    var dict_to_send = []
    for (var key in items_in_cart) {
        console.log("trying to process key: ", key);
        var count = items_in_cart[key];
	var product = products[key]
        if (typeof product === "undefined") {
            product = search_in_list(items_in_cart_to_display, key)
        }
        // your code
        console.log("funcrtion over **********************");
        dict_to_send.push({
            'name': key,
            'price': product["price"],
            'id': product["id"],
            'image': product["image"],
            'qty': count,
            'item_total': (count * parseFloat(product['price'])).toFixed(2)
        });
        total_price += count * parseFloat(product['price']);
    }
    console.log('Going to send this::');
    console.log(dict_to_send);
    req.session.key["cart_to_display"] = dict_to_send
    req.session.key["cart"]["total_price"] = total_price.toFixed(2)  
    final_dict = {
        items_in_cart: dict_to_send,
        email: req.session.key["name"],
        total: total_price.toFixed(2),
    }
    res.render('cart.ejs', {
        //jsonData: JSON.stringify(final_dict)
        jsonData: final_dict
    });
    //res.render("cart.ejs", {total:total,email:req.session.key["name"],image : productresult["image"],productname:productresult["name"], id:productresult["id"],price:price,quantity:productresult["quantity"]});
});

app.post('/cart.html', function(req, res) {
	if(req.body['delete']) {
		console.log("delete", req.body['delete']);
		var choc = req.body['delete'];
		console.log(req.session.key['cart']['items']);
		delete req.session.key['cart']['items'][req.body['delete']];
		console.log(req.session.key['cart']['items']);
		res.redirect("cart.html");
		
	} else {
		res.redirect(req.body['checkout'] + ".html");
	}
});

app.get('/dummy.html',function(req,res){
    res.writeHead(404,{"Content-Type":"application/json"});
});

app.get('/404.html',function(req,res){
    res.sendfile("404.html");
});


app.get('/logout',function(req,res){
    if(req.session.key) {
        console.log("********************************Logging out *******************");
	var backendUrl = endpoint + req.session.key["email"] + "/cart";
        var data_to_send = {
            'items': req.session.key["cart"]["items"],
            'cart_to_display': req.session.key["cart_to_display"]
        }
	
        PutCode(backendUrl, data_to_send);
        req.session.destroy(function(err){
	if (err) {
		console.log(err);
	} else {
       		 res.redirect('/');
	}
    });
    } else {
        res.redirect('/');
    }
});

app.get('/checkout.html', function(req, res) {
    res.render("checkout.html",{email : req.session.key["name"], total: req.session.key["cart"]["total_price"]});
});

app.post('/checkout.html', function(req, res) {
        res.redirect("success.html");
	
});

app.get('/success.html',function(req,res){
        
	
	var backendUrl = endpoint + req.session.key["email"] + "/cart";
        var data_to_send = {
            'items': {},
            'cart_to_display': []
        }
        console.log("SUCCESS URL CHANGE :",data_to_send);
        PutCode(backendUrl, data_to_send);
        
	req.session.key["cart"]["items"] = {}
        req.session.key["cart_to_display"] = []
        
	res.render("success.html",{email:req.session.key["name"]});		
});

app.post('/success.html', function(req, res) {
	res.redirect(req.body['logout'] + ".html");
});

app.get('/logout.html',function(req,res){
        res.redirect('/');
});

/*
app.listen(app.get('port'),function(){
  console.log("Started on PORT 8080");
})
*/


app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
})
