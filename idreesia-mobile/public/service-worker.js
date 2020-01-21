/* global importScripts, workbox */
/* eslint-disable no-restricted-globals */

importScripts('/workbox-v4.3.1/workbox-sw.js');

workbox.setConfig({
  modulePathPrefix: '/workbox-v4.3.1/',
});

if (workbox) {
  workbox.routing.registerRoute(
    /\.(?:js|css)$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
    })
  );
}
