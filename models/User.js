const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
	email: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true,
		validate: [validator.isEmail, 'Invalid Email Address'],
		required: 'Please Supply an Email Address'
	},
	name: {
		type: String,
		required: 'Please Supply A Name',
		trim: true
	},
	apiKeys: [{
		type: String,
		unique: true,
		sparse: true
	}],
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	jobs: [
		{
			type: mongoose.Schema.Types.ObjectId, 
			ref: 'Job'
		}
	]
});

userSchema.index({
	apiKeys: 'text'
});

userSchema.plugin(passportLocalMongoose, {usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
