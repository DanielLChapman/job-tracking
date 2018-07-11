import { combineReducers } from 'redux';
import JOBSReducer from './reducer_job';

const jobReducer = combineReducers({
	jobs: JOBSReducer
});

export default jobReducer;
