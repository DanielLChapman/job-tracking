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

let cookie = null;


let userRegisterCredentials = {
  name: 'Test',
  email: 'example@foo.bar', 
  password: 'foobar',
  passwordConfirm: 'foobar'
};

const userRegisterCredentials2 = {
  name: 'Test2',
  email: 'example2@foo.bar', 
  password: 'foobar',
  passwordConfirm: 'foobar'
}

let jobCredentials = {
  position: 'Text',
  company: 'text'
};

describe('Testing User Model Validation', () => {
  describe('Invalid Credentials', () => {
    after(function(done){
      User.remove({}, (err) => { 
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

    it('should not register with the same email', (done) => {
      chai.request.agent(app)
        .post('/register')
        .send(userRegisterCredentials)
        .end(function(err, res) {
          res.should.have.status(422);
          res.req.path.should.equal('/register');
          res.request.cookies.should.be.empty;
          done();
        });
    });

    it('should not register with an invalid name', (done) => {
      delete userRegisterCredentials.name;
      chai.request.agent(app)
        .post('/register')
        .send(userRegisterCredentials)
        .end(function(err, res) {
          res.should.have.status(422);
          res.req.path.should.equal('/register');
          res.request.cookies.should.be.empty;
          done();
        });
    });

    it('should not register with an invalid email', (done) => {
      userRegisterCredentials.name = "Dax"
      delete userRegisterCredentials.email;
      chai.request.agent(app)
        .post('/register')
        .send(userRegisterCredentials)
        .end(function(err, res) {
          res.should.have.status(422);
          res.req.path.should.equal('/register');
          res.request.cookies.should.be.empty;
          done();
        });
    });

    it('should not register with an invalid email - 2', (done) => {
      userRegisterCredentials.email = "Bod";
      chai.request.agent(app)
        .post('/register')
        .send(userRegisterCredentials)
        .end(function(err, res) {
          res.should.have.status(422);
          res.req.path.should.equal('/register');
          res.request.cookies.should.be.empty;
          done();
        });
    });
    it('should not register with an invalid email - 3', (done) => {
      userRegisterCredentials.email = "Bod@aa";
      chai.request.agent(app)
        .post('/register')
        .send(userRegisterCredentials)
        .end(function(err, res) {
          res.should.have.status(422);
          res.req.path.should.equal('/register');
          res.request.cookies.should.be.empty;
          done();
        });
    });

    it('should not register with an empty password', (done) => {
      userRegisterCredentials.email = "Bod@aa.com";
      delete userRegisterCredentials.password
      chai.request.agent(app)
        .post('/register')
        .send(userRegisterCredentials)
        .end(function(err, res) {
          res.should.have.status(422);
          res.req.path.should.equal('/register');
          res.request.cookies.should.be.empty;
          done();
        });
    });

    it('should not register with an empty password confirm', (done) => {
      userRegisterCredentials.password = "Bod";
      delete userRegisterCredentials.passwordConfirm
      chai.request.agent(app)
        .post('/register')
        .send(userRegisterCredentials)
        .end(function(err, res) {
          res.should.have.status(422);
          res.req.path.should.equal('/register');
          res.request.cookies.should.be.empty;
          done();
        });
    });

    it('should not register with a different password and passwordConfirm', (done) => {
      userRegisterCredentials.password = "Bod";
      userRegisterCredentials.passwordConfirm = ".com";
      chai.request.agent(app)
        .post('/register')
        .send(userRegisterCredentials)
        .end(function(err, res) {
          res.should.have.status(422);
          res.req.path.should.equal('/register');
          res.request.cookies.should.be.empty;
          done();
        });
    });
  });

  describe('Model should have many jobs', () => {
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
          chai.assert(cookie != null);
          done();
        });
    });
    after(function(done){
      User.remove({}, (err) => { 
            done();         
          });  
    });

    it('Should create a job', (done) => {
      chai.request.agent(app)
        .post('/api/jobs/')
        .set('Cookie', cookie)
        .send(jobCredentials)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .end(function(err, res) {
          res.should.have.status(200);
          var tempJSON = JSON.parse(res.text)[0];
          tempJSON.position.should.equal('Text');
          done();
        });

    });

  })
});


describe('Testing Job Model Validation', () => {
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
          chai.assert(cookie != null);
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

    it('Should not create a job', (done) => {
      delete jobCredentials.position;
      chai.request.agent(app)
        .post('/api/jobs/')
        .set('Cookie', cookie)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send(jobCredentials)
        .end(function(err, res) {
          var tempJSON = JSON.parse(res.text)[0];
          console.log(tempJSON);
          res.should.have.status(422);
          done();
        });

    });

    it('Should not create a job', (done) => {
      jobCredentials.position = "Text";
      delete jobCredentials.company;
      chai.request.agent(app)
        .post('/api/jobs/')
        .set('Cookie', cookie)
        .send(jobCredentials)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .end(function(err, res) {
          var tempJSON = JSON.parse(res.text)[0];
          console.log(tempJSON);
          res.should.have.status(422);
          done();
        });

    });

    it('Should create a job', (done) => {
      jobCredentials.company = "Text";
      chai.request.agent(app)
        .post('/api/jobs/')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .send(jobCredentials)
        .end(function(err, res) {
          var tempJSON = JSON.parse(res.text)[0];
          console.log(tempJSON);
          res.should.have.status(201);
          done();
        });

    });

});