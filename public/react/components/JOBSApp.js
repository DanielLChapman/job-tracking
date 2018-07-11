import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { types, helloworld } from '../actions/index';


class JOBSApp extends Component {
	constructor (props) {
		super(props);
		this.state = {
			view: 'Initial'
		};

	}


	render () {
		return (
			<div>
				Hello
			</div>
		);
	}
}

function mapDispatchToProps (dispatch) {
	return bindActionCreators({ helloworld }, dispatch);
}

export default connect(null, mapDispatchToProps)(JOBSApp);



