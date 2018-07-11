import { GRAB_API_KEYS, GENERATE_API_KEY, DELETE_API_KEY } from '../actions/index';

export default function (state = [], action) {
	switch (action.type) {
	case GRAB_API_KEYS:	
		return action.payload.data.apiKeys || state;
	case GENERATE_API_KEY:
		if (action.payload.data.apiKey) {
			return [...state, action.payload.data.apiKey];
		}
		else {
			alert(action.payload.data);
			return state;
		}
		
	case DELETE_API_KEY:
		if (action.payload.data.success === "Successfully") {
			var i = state.indexOf(action.payload.data['api key']);
			if (i > -1) {
				state.splice(i, 1);
			}
			return [...state];
		}else {
			return state;
		}
	default:
		return state;
	}
}
