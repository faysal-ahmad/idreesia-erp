// All server config (MAIL_URL, GOOGLE_OAUTH_CLIENT_ID/SECRET, JOBS_ENABLED,
// MONGO_URL, ...) is read directly from process.env, set as App Platform
// component env vars. pm2-runtime inherits the container's environment, so
// nothing needs to be declared here.
module.exports = {
  apps: [
    {
      name: 'Idreesia-Web',
      script: 'node ./bundle/main.js',
      autorestart: true,
    }
  ]
};
