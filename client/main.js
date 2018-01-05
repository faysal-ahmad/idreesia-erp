import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom'

import 'bootstrap';
import '../node_modules/bootstrap/dist/css/bootstrap.css';

import App from '../imports/ui/app.js';

Meteor.startup(() => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    document.getElementById('render-target')
  );
});
