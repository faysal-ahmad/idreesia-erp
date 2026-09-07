// All shared server config (MAIL_URL, GOOGLE_OAUTH_CLIENT_ID/SECRET,
// MONGO_URL, ...) is read directly from process.env, set as App Platform
// component env vars - pm2-runtime inherits the container's environment, so
// it doesn't need to be declared here.
//
// JOBS_ENABLED / WEB_SERVER_ENABLED / PORT are role flags that MUST differ
// between the two apps below, so they're set explicitly here rather than
// inherited: Idreesia-Web serves GraphQL/HTTP traffic only, Idreesia-Jobs
// runs the agenda-based background job processor only. Both boot the same
// bundle - see imports/startup/server/index.ts and setup-agenda.ts.
module.exports = {
  apps: [
    {
      name: 'Idreesia-Web',
      script: 'node ./bundle/main.js',
      autorestart: true,
      env: { JOBS_ENABLED: 'false' },
    },
    {
      name: 'Idreesia-Jobs',
      script: 'node ./bundle/main.js',
      autorestart: true,
      // PORT is a distinct, never-exposed port - Meteor's webapp package
      // always binds one regardless of role, and it can't share the web
      // app's port within the same container.
      env: { JOBS_ENABLED: 'true', WEB_SERVER_ENABLED: 'false', PORT: '3001' },
    },
  ]
};
