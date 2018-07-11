import axios from 'axios';

export const types = {
	HELLO_WORLD: "HELLO_WORLD"
}
var test = null;
export function helloworld (element) {
	const data = element

	return {
		type: types.HELLO_WORLD,
		payload: data
	};
}
