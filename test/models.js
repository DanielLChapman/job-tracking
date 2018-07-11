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
