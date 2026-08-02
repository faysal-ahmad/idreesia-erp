import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';

import './main.css';
import App from '../imports/ui/app';

Meteor.startup(() => {
  const renderTarget = document.getElementById('render-target');

  if (renderTarget) {
    render(<App />, renderTarget);
  }
});
