const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobsController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

/* GET home page. */
router.get('/', jobsController.homePage);




module.exports = router;
