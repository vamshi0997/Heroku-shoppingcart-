var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local');

passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	User.findById(id, function(err, user){
		done(err, user);
	});
});


// user signup strategy
passport.use('local.signup', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
	}, 
	function(req, email, password, done){
		req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
		req.checkBody('password', 'Invalid password').notEmpty().isLength({min:4});
		var errors = req.validationErrors();
		if (errors) {
			var messages = [];
			errors.forEach(function(error){
				messages.push(error.msg);
			});
			return done(null, false, req.flash('error', messages));
		}
		User.findOne({'email': email}, function(err, user){
			if (err){
				return done(err);
			}
			if (user){
				return done(null, false, {message: 'Email already in use'})
			}
			var newUser = new User();
			newUser.email = email;
			newUser.password = newUser.encryptPassword(password);
			newUser.save(function(err, result){
				if (err){
					return done(err);
				}
				return done(null, newUser);
			});
		})}
));


// user signin strategy
passport.use('local.signin', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
	}, 
	function(req, email, password, done){
		req.checkBody('email', 'Invalid Email').notEmpty();
		req.checkBody('password', 'Invalid password').notEmpty();
		var errors = req.validationErrors();
		console.log('errors in passport module :' + errors);
		if (errors) {
			var messages = [];
			errors.forEach(function(error){
				messages.push(error.msg);
			});
			console.log('authentication failed');
			return done(null, false, req.flash('error', messages));
		}
		User.findOne({'email': email}, function(err, user){
			if (err){
				console.log('authentication failed');
				return done(err);
			}
			if (!user){
				console.log('authentication failed');
				return done(null, false, {message: 'No user found.'});
			}
			if (!user.validPassword(password)){
				console.log('authentication failed');
				return done(null, false, {message: 'Wrong password'});
			}
			console.log('authentication suceeded');
			return done(null, user);
		});}
));