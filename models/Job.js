const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');
const crypto = require('crypto');


const jobSchema = new mongoose.Schema({
	position: {
		type: String,
		trim: true,
		required: 'Please enter a position'
	},
	company: {
		type: String,
		trim: true,
		required: 'Please enter a company'
	},
	url: {
		type: String,
		trim: true
	},
	oid : { 
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: 'You must supply an author'
	}
}, {
  timestamps: true
});

jobSchema.index({
	position: 'text',
	company: 'text'
});


module.exports = mongoose.model('Job', jobSchema);
