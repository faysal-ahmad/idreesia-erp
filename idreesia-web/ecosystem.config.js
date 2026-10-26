// All shared server config (MAIL_URL, MONGO_URL, S3_*, ...) is read directly
// from process.env, set as App Platform component env vars - pm2-runtime
// inherits the container's environment, so it doesn't need to be declared here.
//
// JOBS_ENABLED / WEB_SERVER_ENABLED / PORT are role flags that MUST differ
// between the two apps below, so they're set explicitly here rather than
// inherited: Idreesia-Web serves GraphQL/HTTP traffic only, Idreesia-Jobs
// runs the agenda-based background job processor only. Both boot the same
// bundle - see imports/startup/server/index.ts and setup-agenda.ts.
//
// Memory: both processes share one 2 GB container, but left to itself each
// Node process sizes its heap as if it had the whole container to itself.
// The --max-old-space-size caps below (768 + 512 MB) leave ~700 MB for
// native memory (OpenCV, sharp, Node itself) and pm2. MALLOC_ARENA_MAX=2
// stops glibc keeping a separate malloc arena per OpenCV/libvips worker
// thread, which otherwise holds on to freed native memory indefinitely.
// Revisit the caps if the container size changes.
const MALLOC_ARENA_MAX = '2';

module.exports = {
  apps: [
    {
      name: 'Idreesia-Web',
      script: 'node ./bundle/main.js',
      autorestart: true,
      env: {
        JOBS_ENABLED: 'false',
        NODE_OPTIONS: '--max-old-space-size=768',
        MALLOC_ARENA_MAX,
      },
    },
    {
      name: 'Idreesia-Jobs',
      script: 'node ./bundle/main.js',
      autorestart: true,
      // PORT is a distinct, never-exposed port - Meteor's webapp package
      // always binds one regardless of role, and it can't share the web
      // app's port within the same container.
      env: {
        JOBS_ENABLED: 'true',
        WEB_SERVER_ENABLED: 'false',
        PORT: '3001',
        NODE_OPTIONS: '--max-old-space-size=512',
        MALLOC_ARENA_MAX,
      },
    },
  ]
};
