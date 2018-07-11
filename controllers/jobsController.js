const mongoose = require('mongoose');
const promisify = require('es6-promisify');
const crypto = require('crypto');
/* Plain Page Rendering */

function hashPass(pass, salt) {
	return crypto.pbkdf2Sync(pass, salt, 10000, 256, 'sha').toString('hex');
}

exports.homePage = async (req, res) => {
	res.render('index', {title: 'Index'});
}

