import React from 'react';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';

import './main.css';
import App from '../imports/ui/app';

Meteor.startup(() => {
  const renderTarget = document.getElementById('render-target');

  if (renderTarget) {
    createRoot(renderTarget).render(<App />);
  }
});
