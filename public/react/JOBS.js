import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from "redux";
import ReduxPromise from "redux-promise";

import JOBSApp from './components/JOBSApp';
import jobReducers from "./reducers/jobs";


const createStoreWithMiddleware = applyMiddleware(ReduxPromise)(createStore);

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(jobReducers)}>
    <JOBSApp />
  </Provider>,
  document.querySelector('.react-container')
);
