const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobsController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

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

/* get*/
router.get('/users/:user_id', jobsController.returnHere);
/* index */
router.get('/users/', jobsController.returnHere);
/* create */
router.post('/users', jobsController.returnHere);
/* edit */
router.patch('/users/:user_id', jobsController.returnHere);
/* edit */
router.put('/users/:user_id', jobsController.returnHere);
/* destroy */
router.delete('/users/:user_id', jobsController.returnHere);

/* get job */
router.get('/jobs/:job_id', jobsController.returnHere);
/* index job */
router.get('/jobs/',
	authController.apiIsLoggedIn,
 	jobsController.returnHere);
/* create job*/
router.post('/jobs/', jobsController.returnHere);
/* patch edit job*/
router.patch('/jobs/:job_id', jobsController.returnHere);
/* put edit job */
router.put('/jobs/:job_id', jobsController.returnHere);
/* destroy job */
router.delete('/jobs/:job_id', jobsController.returnHere);



module.exports = router;
