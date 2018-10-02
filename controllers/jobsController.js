const mongoose = require('mongoose');
const promisify = require('es6-promisify');
const crypto = require('crypto');
const { body } = require('express-validator/check');
const sanitize = require('express-validator/filter');
const validator = require('validator');
const User = mongoose.model('User');
const Job = mongoose.model('Job');
/* Plain Page Rendering */

function hashPass(pass, salt) {
	return crypto.pbkdf2Sync(pass, salt, 10000, 256, 'sha').toString('hex');
}

exports.homePage = (req, res) => {
	res.render('index', {title: 'Index'});
}

exports.returnHere = (req, res) => {
	res.json('Here');
}

exports.validateJobData = (req, res, next) => {
	var job = {
		position: null,
		company: null,
		url: null,
		oid: res.user._id
	};
	let response;
	try {
		job.position = req.body.position || req.body.job.position;
	}
	catch (e) {
		response = {
			Status: "Error",
			Message: "Invalid or Missing Position"
		}
		return res.status(422).json(response);
	}
	try {
		job.company = req.body.company || req.body.job.company;
	}
	catch (e) {
		response = {
			Status: "Error",
			Message: "Invalid or Missing Company"
		}
		return res.status(422).json(response);
	}

	try {
		job.url = req.body.url || req.body.job.url;
	} catch(e ) {
		job.url = null;
	}

	job.position = job.position.replace(/[^\w\s]/gi, '');
	job.company = job.company.replace(/[^\w\s]/gi, '');


	if(!validator.isAlphanumeric( job.position)) {
		response = {
			Status: "Error",
			Message: "Invalid Position, a-zA-Z and numbers only"
		}
		return res.status(422).json(response);
	}

	if(!validator.isAlphanumeric( job.company)) {
		response = {
			Status: "Error",
			Message: "Invalid Company, a-zA-Z and numbers only"
		}
		return res.status(422).json(response);
	}

	if (job.url !== null && typeof job.url !== undefined) {
		if (!validator.isFQDN(job.url)) {
			response = {
				Status: "Error",
				Message: "Invalid URL, Either include a real domain name or nothing"
			}
			return res.status(422).json(response);
		}
	}
	res.job = job;
	next();
}

exports.createJob = async (req, res) => {
	const job = new Job(res.job);
	await job.save((err) => {	
		if (err !== null) {
			console.log(err);
			res.status(422).json(err);
		}
	});
	let jobs = res.user.jobs;
	jobs.push(job);
	const user = await User.findOneAndUpdate(
		{_id: res.user._id}, 
		{ $set: {jobs: jobs} },
		{ new: true, context: 'query'}
	);

	res.json(res.job);
}

exports.indexJobs = async(req, res) => {
	const jobs = await User.findById(res.user._id, 'jobs').populate('jobs');
	res.json(jobs);
}

exports.getJob = async(req, res) => {
	const jobs = await User.findById(res.user._id, 'jobs').populate('jobs');
	let job = null, response;

	jobs.jobs.forEach((x) => {
		if (x._id == req.params.job_id) {
			job = x;
		}
	})

	//SHOULD MAKE SURE JOB EXISTS AND RESPOND WITH CORRECT STATUS CODE
	//MAYBE ANOTHER MIDDLEWARE


	if (job === null) {
		response = {
			Status: "Error",
			Message: "Job either Doesn't exist or you do not own it"
		}
		return res.status(401).json(response);
	}

	response = {
		Status: "Success",
		job
	}

	res.status(200).json(response);
}

exports.editJob = async (req, res) => {
	//MAYBE MOVE THIS TO MIDDLEWARE
	const user = await User.findById(res.user._id).populate('jobs');
	let job = null, jobs = user.jobs;
	let indexOfJobs, response;

	jobs.forEach((x, i) => {
		if (x._id == req.params.job_id) {
			job = x;
			indexOfJobs = i;
		}
	});

	if (job === null) {
		response = {
			Status: "Error",
			Message: "Job either Doesn't exist or you do not own it"
		}
		return res.status(401).json(response);
	};

	job = await Job.findOneAndUpdate(
		{_id: job._id}, 
		{ $set: res.job },
		{ new: true, runValidators: true, context: 'query'}
	);

	response = {
		Status: "Success",
		job
	}

	res.status(201).json(response);
}

exports.deleteJob = async(req, res) => {
	//MAYBE MOVE THIS TO MIDDLEWARE
	var user = await User.findById(res.user._id).populate('jobs');
	let job = null, jobs = user.jobs;
	let indexOfJobs

	jobs.forEach((x, i) => {
		if (x._id == req.params.job_id) {
			job = x;
			indexOfJobs = i;
		}


	});

	//SHOULD MAKE SURE JOB EXISTS AND RESPOND WITH CORRECT STATUS CODE

	if (job === null) {
		response = {
			Status: "Error",
			Message: "Job either doesn't exist or you do not own it"
		}
		return res.status(403).json(response);
	};

	jobs.splice(indexOfJobs, 1);

	await Job.deleteOne({ _id: job._id }, function (err) {
	  if (err) {
	  	response = {
			Status: "Error",
			Message: "Error in deleting, you may not have position or it may not exist"
		}
	  	return res.status(403).json(response);
	  }
	});

	//NEED TO REMOVE FROM USER TOO
	user = await User.findOneAndUpdate(
		{_id: user._id}, 
		{ $set: jobs },
		{ new: true, runValidators: true, context: 'query'}
	);

	response = {
		Status: "Success",
		Message: "Removed ",
		job
	}

	res.status(201).json(response);
}

exports.displayJobs = (req, res) => {
	res.json('Here');
}

exports.addJob = (req, res) => {
	res.json('Here');
}