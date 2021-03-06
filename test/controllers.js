process.env.SECRET = "test";
process.env.KEY = "test";

let mongoose = require("mongoose");

let Job = require('../models/Job');
let User = require('../models/User');

let cookie = null, cookie2 = null, jobData = null;

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

const userRegisterCredentials2 = {
  name: 'Test2',
  email: 'example2@foo.bar', 
  password: 'foobar',
  passwordConfirm: 'foobar'
}

const userLoginCredentials = {
  email: 'example@foo.bar', 
  password: 'foobar'
}

const jobCredentials = {
  position: "Text",
  company: "text"
};


describe('User Controller', () => {
  before(function(done){
    User.remove({}, (err) => {         
    });  

    chai.request.agent(app)
      .post('/register')
      .send(userRegisterCredentials)
      .end(function(err, res) {
        cookie = res.request.cookies;
        res.should.have.status(200);
        res.req.path.should.equal('/');
        chai.assert(cookie != null, 'cookie is null');
        done();
      });

  });

  after(function(done){
    User.remove({}, (err) => { 
          done();         
        });  
  });

  it('it should expect the number of users to increase', (done) => {

    User.count({}, function( err, count){
        chai.assert(count == 1, 'wrong count');
        done();
    });
  });

  it('should log out', (done) => {
    chai.request(app)
      .get('/logout')
      .send('Cookie', cookie)
      .end((err, res) => {
        res.request.cookies.should.be.empty;
        res.req.path.should.equal('/');
        done();
      });
  });


  it('should request login but fail', (done) => {
    chai.request.agent(app)
      .post('/login')
      .end((err, res) => {
        res.req.path.should.equal('/login');
        done();
      })
  })

  it('should log in', (done) => {
    chai.request.agent(app)
      .post('/login')
      .send(userLoginCredentials)
      .end((err, res) => {
        cookie = res.request.cookies;
        chai.assert(cookie != null, 'cookie is null');
        res.req.path.should.equal('/');
        done();
      });
  });

  it('should fail to update account', (done) => {
    chai.request.agent(app)
      .post('/account')
      .send({
        name: 'Wow'
      })
      .set('Cookie', cookie)
      .end((err, res) => {
        res.req.path.should.equal('/account');
        User.findOne({name: 'Wow'}, function(error, account) {
          chai.assert(account == null, 'Shouldnt have updated');
          done();
        });
      });
  });

  it('should update account', (done) => {
    chai.request.agent(app)
      .post('/account')
      .send({
        name: 'Wow',
        email: userLoginCredentials.email
      })
      .set('Cookie', cookie)
      .end((err, res) => {
        User.findOne({name: 'Wow'}, function(error, account) {
          chai.assert(account != null, 'Account failed to update');
          done();
        });
      });
  });

  describe('User Delete', () => {

    it('should create 2 jobs', (done) => {
      chai.request.agent(app)
        .post('/api/jobs/')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .send(jobCredentials)
        .end((err, res) => {
          res.should.have.status(201);
          res.req.path.should.include('/jobs');
        });
      chai.request.agent(app)
        .post('/api/jobs/')
        .set('Cookie', cookie)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send(jobCredentials)
        .end((err, res) => {
          res.should.have.status(201);
          res.req.path.should.include('/jobs');
          done();
        });
    })

    it('should have 2 jobs', (done) => {
      chai.request(app)
        .get('/api/jobs/')
        .set('Cookie', cookie)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .end((err, res) => {
          Job.count({}, function( err, count){
              chai.assert(count == 2, 'Wrong Count');
          });
          done();
        });
    });

    it('should delete the user', (done) => {
      chai.request.agent(app)
        .delete('/api/users/0')
        .set('Cookie', cookie)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .end((err, res) => {
          res.req.path.should.equal('/');
          User.count({}, function( err, count){
              chai.assert(count == 0, 'Wrong Count');
          });
          done();
        });
    });

    it('Dependent Destroy', (done) => {
      Job.count({}, function( err, count){
          chai.assert(count == 0, 'Wrong count');
      });
      done();
    });

  });

});

describe('Job Controller', () => {

  before(function(done){
    User.remove({}, (err) => {         
    });  
    chai.request.agent(app)
      .post('/register')
      .send(userRegisterCredentials)
      .end(async function(err, res) {
        cookie = res.request.cookies;
        res.should.have.status(200);
        res.req.path.should.equal('/');
        chai.assert(cookie != null, 'Cookie is null');
      });

    chai.request.agent(app)
      .post('/register')
      .send(userRegisterCredentials2)
      .end(async function(err, res) {
        cookie2 = res.request.cookies;
        res.should.have.status(200);
        res.req.path.should.equal('/');
        chai.assert(cookie != null, 'Cookie is null');
        done();
      });
  });

  after(function(done){
    User.remove({}, (err) => {        
    }); 
    Job.remove({}, (err) => {   
      done();  
    }); 
  });

  it('it should create a job', (done) => {
    chai.request.agent(app)
      .post('/api/jobs/')
      .set('Cookie', cookie)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(jobCredentials)
      .end((err, res) => {
        res.should.have.status(201);
        done();
      })
  });

  it('it should create a second job', (done) => {
    chai.request.agent(app)
      .post('/api/jobs/')
      .set('Cookie', cookie2)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(jobCredentials)
      .end((err, res) => {
        res.should.have.status(201);
        done();
      })
  });

  it('it should expect the number of job to increase', (done) => {
    Job.count({}, function( err, count){
        chai.assert(count == 2, 'Wrong Count');
      done();
    });
  });

  it('it should get the index of jobs but fail for no authorization', (done) => {
    chai.request(app)
      .get(`/api/jobs`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
  });


  it('it should get the index of jobs but only return 1', (done) => {
    chai.request(app)
      .get(`/api/jobs`)
      .set('Cookie', cookie)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end((err, res) => {
        jobData = JSON.parse(res.text);
        jobData.length.should.equal(1);
        done();
      })
  });

  it('it should get information about a single job', (done) => {
    chai.request(app)
      .get(`/api/jobs/0`)
      .set('Cookie', cookie)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end((err, res) => {
        jobData = JSON.parse(res.text);
        chai.assert(jobData.position === "Text", 'Invalid text');
        done();
      })
  });

  it('it should fail to get information about a single job for not being the owner', (done) => {
    chai.request(app)
      .get(`/api/jobs/0`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Cookie', cookie2)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
  });

  it('it should update information about a single job', (done) => {
    chai.request(app)
      .put(`/api/jobs/0`)
      .set('Cookie', cookie)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        changes: {
          position: 'Text2'
        }
      })
      .end((err, res) => {
        jobData = JSON.parse(res.text);
        chai.assert(jobData.position === "Text2", 'Failed to update');
        done();
      })
  });
  it('it should update information about a single job', (done) => {
    chai.request(app)
      .patch(`/api/jobs/0`)
      .set('Cookie', cookie)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        changes: {
          position: 'Text3'
        }
      })
      .end((err, res) => {
        jobData = JSON.parse(res.text);
        chai.assert(jobData.position === "Text3", 'Failed to update');
        done();
      })
  });
  it('it should not update information about a single job', (done) => {
    chai.request(app)
      .patch(`/api/jobs/0`)
      .set('Cookie', cookie2)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        changes: {
          position: 'Text3'
        }
      })
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
  });
  
  it('should not delete the job', (done) => {
      chai.request.agent(app)
        .delete('/api/jobs/1')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .end((err, res) => {
          Job.count({}, function( err, count){
              chai.assert(count == 2, 'Wrong count');
          });
          done();
        });
    });

  it('should delete the job', (done) => {
      chai.request.agent(app)
        .delete('/api/jobs/0')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .end((err, res) => {
          Job.count({}, function( err, count){
              chai.assert(count == 1, 'Wrong count');
          });
          done();
        });
    });

});
