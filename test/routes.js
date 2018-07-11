process.env.SECRET = "test";
process.env.KEY = "test";

let mongoose = require("mongoose");

let Job = require('../models/Job');
let User = require('../models/User');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

chai.use(chaiHttp);

const userRegisterCredentials = {
  name: 'Test',
  email: 'example@foo.bar', 
  password: 'foobar',
  passwordConfirm: 'foobar'
}

const userLoginCredentials = {
  email: 'example@foo.bar', 
  password: 'foobar'
}

const jobCredentials = {
	name: "Next"
};

describe('GET Routes', () => {

	it('it should GET the index', (done) => {
	chai.request(app)
	    .get('/')
	    .end((err, res) => {
	        res.should.have.status(200);
	    	done();
	    });
	});

});