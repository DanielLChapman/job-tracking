const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobsController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

/* GET home page. */
router.get('/', jobsController.homePage);

router.get('/login', userController.login);
router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.get('/register', userController.register);

router.get('/account', authController.isLoggedIn, userController.account);

router.post('/register', 
	userController.validateRegister,
	userController.actualRegister,
	authController.login);

router.delete('/delete',
	authController.isLoggedIn,
	catchErrors(userController.deleteAccount));

router.get('/forgot', 
	jobsController.homePage
);

router.get('/jobs', 
	authController.isLoggedIn,
	jobsController.displayJobs);

router.get('/add', 
	authController.isLoggedIn,
	jobsController.addJob);

router.get('/api',
	authController.isLoggedIn,
	userController.apiDisplay);

router.get('/apiKeys', 
	authController.isLoggedIn,
	catchErrors(userController.indexAPIKeys))

router.post('/apiKeys',
	authController.isLoggedIn,
	catchErrors(userController.generateNewAPIKey));

router.delete('/apiKeys', 
	authController.isLoggedIn,
	catchErrors(userController.deleteAPIKey));

/*

router.post('/account', authController.isLoggedIn, catchErrors(userController.updateAccount));


router.post('/updatePassword', 
	authController.isLoggedIn,
	authController.confirmedPasswords,
	catchErrors(authController.changePassword));

*/

//forgot
/*
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', 
	authController.confirmedPasswords, 
	catchErrors(authController.update)
);
*/


module.exports = router;
