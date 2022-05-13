import React from 'react';
import { render } from 'react-dom';

import Popup from './Popup';
import './index.css';

chrome.storage.local.get('state', (obj) => {
  const { state } = obj;
  const initialState = JSON.parse(state || '{}');

  // const createStore = require('../../store/configureStore');

  // console.log('initialState', initialState);

  render(
    <Popup store={initialState} />,
    window.document.querySelector('#app-container')
  );
});

if (module.hot) module.hot.accept();
