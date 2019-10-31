/* global importScripts, workbox */
/* eslint-disable no-restricted-globals */

console.log(`Hello from service worker.`);

importScripts('/workbox-v4.3.1/workbox-sw.js');

workbox.setConfig({
  modulePathPrefix: '/workbox-v4.3.1/',
});

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
  workbox.precaching.precacheAndRoute([]);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}
