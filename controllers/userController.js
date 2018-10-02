const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const Job = mongoose.model('Job');

exports.login = (req, res) => {
	res.render('login', {title: 'Login'})
}

exports.register = (req, res) => {
	res.render('register', {title: 'Register'})
}

exports.validateRegister = (req, res, next) => {
	req.sanitizeBody('name');
	req.checkBody('name', 'You Must Supply a Name!').notEmpty();
	req.checkBody('email', 'That Email is not valid!').isEmail();
	req.sanitizeBody('email').normalizeEmail({
		remove_dots: false,
		remove_extension: false,
		gmail_remove_subaddress: false
	});
	req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
	if (req.body.passwordConfirm) {
		req.checkBody('passwordConfirm', 'Confirmed Password cannot be blank!').notEmpty();
		req.checkBody('passwordConfirm', 'Oops! Your passwords do not match').equals(req.body.password);
	} else {
		req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
		req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);
	}
	
	const errors = req.validationErrors();
	if (errors) {
		req.flash('error', errors.map(err => err.msg));
		res.status(422);
		res.render('register', {title: 'Register', body: req.body, flashes: req.flash() 
		});
		return;
	}
	next(); //No errors
}

exports.actualRegister = async (req, res, next) => {
	const user = new User({ email: req.body.email, name: req.body.name});
	const register = promisify(User.register, User);
	try {
		await register(user, req.body.password);
	} catch(err) {
		req.flash('error', 'Please try again, something may have gone wrong on our end.');
		res.status(422);
		return res.redirect('/register');
	}
	next();
}

exports.account = (req, res) => {
	res.render('account', {title: 'Edit Your Account'});
}

exports.updateAccount = async (req, res) => {
	if (typeof req.body.name == "undefined" || typeof req.body.email == "undefined") {
		req.flash('error', 'Invalid Form Submission');
		return res.redirect('/account');
	}

	let updates = {
		name: req.body.name,
		email: req.body.email
	}

	const user = await User.findOneAndUpdate(
		{_id: req.user._id}, 
		{ $set: updates },
		{ new: true, runValidators: true, context: 'query'}
	);

	req.flash('success', 'Successfully Updated Account');
	res.redirect('/account');
}


exports.deleteAccount = async(req, res) => {
	//DELETE
	const user = req.user;
	req.logout();
	User.remove({ _id: user._id}, function(err) {
		if (!err) {
			Job.remove({oid: user._id}, function(err) {
				if (!err) {
					console.log('deleted user: ' + user.name)
				} else {
					console.log(err);
				}
			})
			req.flash('Success', 'You have deleted your account.');
			res.redirect('/');
		} else {
			req.flash('Error', 'There was an error, try again later');
			res.redirect('/');
		}
	});
}

exports.apiDisplay = (req, res) => {
	res.json('here');
}

exports.indexAPIKeys = async(req, res) => {
	var user = await User.findOne({_id: req.user._id, apiKeys: apiKey});
	const apiKeys = user.apiKeys;
	return res.json({'apiKeys': apiKeys});
}
exports.generateNewAPIKey = async(req, res) => {
	if (req.user.apiKeys.length < 10) {
		const hat = require('hat');
		const newAPIKey = hat();
		const user = await User.findOneAndUpdate(
			{_id: req.user._id}, 
			{ $push: {
				apiKeys: newAPIKey
			}}
		);
		return res.json({'apiKey': newAPIKey});
	} else {
		return res.json({'Error': 'API Keys are limited to 10 per user, contact us if you need more'});
	}
}

exports.deleteAPIKey = async(req, res) => {
	const apiKey = req.body.apiKey;
	if (typeof apiKey === 'undefined') {
		return res.status(400).json({'Error': 'Key Not Found In Data'});
	}
	var user = await User.findOne({_id: req.user._id, apiKeys: apiKey});
	user.apiKeys.pull(apiKey);
	await user.save(function(err) {
		if (err) {
			return res.status(400).json(err);
		}
	});

	res.json({'api key': apiKey, 'success': 'Successfully deleted key'});
}