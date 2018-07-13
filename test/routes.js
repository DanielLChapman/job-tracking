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

let cookie = null, cookie2 = null; 

const userRegisterCredentials = {
  name: 'Test',
  email: 'example@foo.bar', 
  password: 'foobar',
  passwordConfirm: 'foobar'
}

const userRegisterCredentials2 = {
  name: 'Test2',
  email: 'example2@foo.bar', 
  password: 'foobar2',
  passwordConfirm: 'foobar2'
}

const userLoginCredentials = {
  email: 'example@foo.bar', 
  password: 'foobar'
}

const userLoginCredentials2 = {
  email: 'example2@foo.bar', 
  password: 'foobar2'
}

const jobCredentials = {
	name: "Next"
};

describe('GET Routes, no authentication required', () => {

	it('it should GET the index', (done) => {
	chai.request(app)
	    .get('/')
	    .end((err, res) => {
	        res.should.have.status(200);
	    	done();
	    });
	});

	it('it should GET the login', (done) => {
	chai.request(app)
	    .get('/login')
	    .end((err, res) => {
	        res.should.have.status(200);
	    	done();
	    });
	});

	it('it should GET the register', (done) => {
	chai.request(app)
	    .get('/register')
	    .end((err, res) => {
	        res.should.have.status(200);
	    	done();
	    });
	});

	it('it should GET the forgot', (done) => {
	chai.request(app)
	    .get('/forgot')
	    .end((err, res) => {
	        res.should.have.status(200);
	    	done();
	    });
	});

	it('it should GET the error page', (done) => {
	chai.request(app)
	    .get('/alibaba')
	    .end((err, res) => {
	        res.should.have.status(404);
	    	done();
	    });
	});

});

describe('GET Routes, require authentication', () => {
	//follow redirect
	it('it should GET the account page and then return error', (done) => {
	chai.request(app)
	    .get('/account').redirects(0)
	    .end((err, res) => {
	        res.should.redirectTo('/login')
	    	done();
	    });
	});

	it('it should GET the users job page and then return error', (done) => {
	chai.request(app)
	    .get('/jobs').redirects(0)
	    .end((err, res) => {
	        res.should.redirectTo('/login')
	    	done();
	    });
	});

	it('it should GET the add job page and then return error', (done) => {
	chai.request(app)
	    .get('/add').redirects(0)
	    .end((err, res) => {
	        res.should.redirectTo('/login')
	    	done();
	    });
	});

});

describe('GET Routes, require authentication with login', () => {
	before(function(done){
		chai.request.agent(app)
			.post('/register')
			.send(userRegisterCredentials)
			.end(function(err, res) {
				cookie = res.request.cookies;
				res.should.have.status(200);
				res.req.path.should.equal('/');
				chai.assert(cookie != null);
				done();
			});
	});

	after(function(done){
		User.remove({}, (err) => { 
        	done();         
        });  
	});

	//get users edit
	it('it should GET the account page ', (done) => {
	chai.request(app)
	    .get('/account')
	    .set('Cookie', cookie)
	    .end((err, res) => {
	        res.req.path.should.equal('/account');
	        res.should.have.status(200);
	    	done();
	    });
	});

	it('it should GET the users job page ', (done) => {
	chai.request(app)
	    .get('/jobs')
	    .set('Cookie', cookie)
	    .end((err, res) => {
	        res.req.path.should.equal('/jobs');
	        res.should.have.status(200);
	    	done();
	    });
	});
	//get an edit page for jobs?


	it('it should GET the add job page ', (done) => {
	chai.request(app)
	    .get('/add').redirects(0)
	    .set('Cookie', cookie)
	    .end((err, res) => {
	        res.req.path.should.equal('/add');
	        res.should.have.status(200);
	    	done();
	    });
	});

});

describe('POST Routes, no authentication', () => {
	//login
	it('it should POSt the login with no information/invalid information and have nothing happen', (done) => {
	chai.request(app)
	    .post('/login')
	    .end((err, res) => {
	    	res.req.path.should.equal('/login');
	        res.should.have.status(401);
	    	done();
	    });
	});

	//create
	it('it should POST the register', (done) => {
	chai.request(app)
	    .post('/register')
	    .end((err, res) => {
	        res.req.path.should.equal('/register');
	        res.should.have.status(422);
	    	done();
	    });
	});

});

describe('POST Routes, authentication', () => {
	before(function(done){
		chai.request.agent(app)
			.post('/register')
			.send(userRegisterCredentials)
			.end(function(err, res) {
				cookie = res.request.cookies;
				res.should.have.status(200);
				res.req.path.should.equal('/');
				chai.assert(cookie != null);
				done();
			});
	});

	after(function(done){
		User.remove({}, (err) => { 
        	done();         
        });  
	});

	//login
	it('it should POST the login with valid information', (done) => {
	chai.request(app)
	    .post('/login')
	    .send(userLoginCredentials)
	    .end((err, res) => {
	    	res.req.path.should.equal('/');
	        res.should.have.status(100);
	    	done();
	    });
	});

	//api 

});

describe('API Routes, no authentication', () => {
	/* 

	/api/users/:id get user
	/api/users index users should return an error as its not allowed, future for admins
	/api/users post create
	//edit page is /account, no api
	/api/users/:id patch update
	/api/users/:id put update
	/api/users/:id delete destroy

	/api/jobs/:id get job
	/api/jobs/ get index jobs
	/api/jobs post create
	//edit jobs should be something else
	/api/jobs/:id patch update:
	/api/jobs/:id put update:
	/api/jobs/:id delete destroy

	*/
	it('it should not get user by id without authentication', (done) => {
		chai.request(app)
		    .get('/api/users/0')
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});
	it('it should not index users and fail without authentication', (done) => {
		chai.request(app)
		    .get('/api/users/')
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});
	it('it should not POST user create without authentication', (done) => {
		chai.request(app)
		    .post('/api/users/')
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});
	it('it should not patch update users without authentication', (done) => {
		chai.request(app)
		    .patch('/api/users/0')
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});
	it('it should not put update users without authentication', (done) => {
		chai.request(app)
		    .put('/api/users/0')
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});
	it('it should not delete destroy users without authentication', (done) => {
		chai.request(app)
		    .delete('/api/users/0')
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});


	it('it should not get job by id without authentication', (done) => {
		chai.request(app)
		    .get('/api/jobs/0')
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});
	it('it should not index jobs and fail without authentication', (done) => {
		chai.request(app)
		    .get('/api/jobs/')
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});
	it('it should not POST job create without authentication', (done) => {
		chai.request(app)
		    .post('/api/jobs/')
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});
	it('it should not patch job update without authentication', (done) => {
		chai.request(app)
		    .patch('/api/jobs/0')
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});
	it('it should not put job update without authentication', (done) => {
		chai.request(app)
		    .put('/api/jobs/0')
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});
	it('it should not delete destroy job without authentication', (done) => {
		chai.request(app)
		    .delete('/api/jobs/0')
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});
})

describe('API Routes, authentication but invalid data', () => {
	before(function(done){
		chai.request.agent(app)
			.post('/register')
			.send(userRegisterCredentials)
			.end(function(err, res) {
				cookie = res.request.cookies;
				res.should.have.status(200);
				res.req.path.should.equal('/');
				chai.assert(cookie != null);
				done();
			});
	});

	before(function(done){
		chai.request.agent(app)
			.post('/api/jobs')
			.set('Cookie', cookie)
			.send('jobCredentials')
			.end(function(err, res) {
				res.should.have.status(201);
				done();
			});
	});


	before(function(done){
		chai.request.agent(app)
			.post('/register')
			.send(userRegisterCredentials2)
			.end(function(err, res) {
				cookie2 = res.request.cookies;
				res.should.have.status(200);
				res.req.path.should.equal('/');
				chai.assert(cookie != null);
				done();
			});
	});

	before(function(done){
		chai.request.agent(app)
			.post('/api/jobs')
			.set('Cookie', cookie2)
			.send('jobCredentials')
			.end(function(err, res) {
				res.should.have.status(201);
				done();
			});
	});

	after(function(done){
		User.remove({}, (err) => { 
        	done();         
        });  
        Job.remove({}, (err) => {
        	done();
        })
	});

	//.set('Cookie', cookie)
	//api key not implemented but will be converted to temp session so 
	//should be same as cookie for right now

	it('it should get user by id ', (done) => {
		chai.request(app)
		    .get('/api/users/0')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		    	console.log('cookie vs apiKey');
		       	res.should.have.status(200);
		    	done();
	    });
	});

	it('it should not index users', (done) => {
		chai.request(app)
		    .get('/api/users/')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		    	//only allow for admins
		    	console.log('admins only')
		       	res.should.have.status(401);
		    	done();
	    });
	});

	it('it should not POST user create without data or invalid data', (done) => {
		chai.request(app)
		    .post('/api/users/')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		       	res.should.have.status(422);
		    	done();
	    });
	});
	it('it should not patch update users with invalid data', (done) => {
		chai.request(app)
		    .patch('/api/users/0')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		       	res.should.have.status(422);
		    	done();
	    });
	});
	it('it should not patch update different user', (done) => {
		chai.request(app)
		    .patch('/api/users/1')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});

	it('it should not put update users without authentication', (done) => {
		chai.request(app)
		    .put('/api/users/0')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		       	res.should.have.status(422);
		    	done();
	    });
	});
	it('it should not put update different user', (done) => {
		chai.request(app)
		    .put('/api/users/1')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});

	it('it should not delete destroy other users', (done) => {
		chai.request(app)
		    .delete('/api/users/1')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});

	it('it should get job by id', (done) => {
		chai.request(app)
		    .get('/api/jobs/0')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		       	res.should.have.status(200);
		    	done();
	    });
	});

	it('it should get job by id', (done) => {
		chai.request(app)
		    .get('/api/jobs/1')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		    	//cant delete someone else's
		       	res.should.have.status(401);
		    	done();
	    });
	});

	it('it should index jobs ', (done) => {
		chai.request(app)
		    .get('/api/jobs/')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		       	res.should.have.status(200);
		    	done();
	    });
	});
	it('it should not POST job create with invalid data', (done) => {
		chai.request(app)
		    .post('/api/jobs/')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		       	res.should.have.status(422);
		    	done();
	    });
	});
	it('it should not patch job update with invalid data or no data', (done) => {
		chai.request(app)
		    .patch('/api/jobs/0')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		       	res.should.have.status(422);
		    	done();
	    });
	});
	it('it should not put job update with invalid or no data', (done) => {
		chai.request(app)
		    .put('/api/jobs/0')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		       	res.should.have.status(422);
		    	done();
	    });
	});
	it('it should not put job update someone elses with or withoutinvalid or no data', (done) => {
		chai.request(app)
		    .put('/api/jobs/1')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		       	res.should.have.status(403);
		    	done();
	    });
	});

	it('it should delete destroy job', (done) => {
		chai.request(app)
		    .delete('/api/jobs/0')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		       	res.should.have.status(204);
		       	done();
	    });
	});
	it('it should delete destroy someone elses job', (done) => {
		chai.request(app)
		    .delete('/api/jobs/1')
		    .set('Cookie', cookie)
		    .end((err, res) => {
		       	res.should.have.status(403);
		       	done();
	    });
	});
})