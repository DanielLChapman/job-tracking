const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const axios = require('axios');

exports.login = passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: 'Failed Login!',
	successRedirect: '/',
	successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'You are now logged out!');
	res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		next();
	}
	else {
		return res.redirect('/login');
	}
}

exports.forgot = async(req, res) => {
	//user exists
	const user = await User.findOne({email: req.body.email});
	if(!user) {
		req.flash('Success', 'A password reset has been sent!');
		return res.redirect('/login');
	}
	//set reset tokens and expiry
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 3600000; //1 hour
	await user.save();
	//Send Email
	const url = `https://api:${process.env.MAILGUN_API_KEY}@api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`;
	const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
	axios.post(url, "", { params: {
		from: `noreply@${process.env.MAILGUN_DOMAIN}`,
		to: user.email,
		subject: "PL-A Forgot Password",
		text: `Reset Password at this url: ${resetURL}`,
		html: `<h4>Click <a href="${resetURL}">here </a> to reset your password for PL-A</h4>. <br />
		<h4>Ignore this email if you didnt request this.</h4> <br />
		<h4>If the link doesnt work, copy and paste this into your url: ${resetURL}</h4>`
	}}
	).then(function (response) {
	    console.log(response);
	  })
	  .catch(function (error) {
	    console.log(error);
	  });


	//Redirect to login page
	req.flash('Success', 'A password reset has been sent! `${resetURL}`');
	res.redirect('/login');
}

exports.reset = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	});
	if (!user) {
		req.flash('error', 'Password reset is invalid or has expired');
		return res.redirect('/login');
	}
	res.render('reset', {title: 'Reset Your Password'});
}

exports.confirmedPasswords = (req,res, next) => {
	if (req.body.password === req.body['password-confirm'])
	{
		return next();
	}
	req.flash('error','Passwords Do Not Match!');
	res.redirect('back');
}

exports.update = async(req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	});
	if (!user) {
		req.flash('error', 'Password reset is invalid or has expired');
		return res.redirect('/login');
	}

	const setPassword = promisify(user.setPassword, user);

	await setPassword(req.body.password);
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	const updatedUser = await user.save();
	await req.login(updatedUser);
	req.flash('success', 'Password has been reset');
	res.redirect('/');

}

exports.changePassword = async(req, res) => {
	let user = await User.findOne({_id: req.user._id});
	const updatePassword = promisify(user.changePassword, user);

	await updatePassword(req.body['current-password'], req.body.password)
	.then(function() {
  		req.flash('Success', 'Password Successfully Updated');
		res.redirect('/login');
	}).catch(function(e) {
		return res.json(e);
	});
   
}
