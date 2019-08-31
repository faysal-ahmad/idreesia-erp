module.exports = {
  apps: [
    {
      name: 'Idreesia-Web',
      script: 'node ../build/idreesia-web/bundle/main.js',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        MONGO_URL: 'mongodb://localhost:27017/idreesia-erp',
        ROOT_URL: 'https://381-erp-server.ngrok.io',
        PORT: 3000,
        METEOR_SETTINGS: {
          private: {
            jobsAppUrl: 'http://localhost:3002',
          },
        },
      },
    },
    {
      name: 'Idreesia-Mobile',
      script: 'node ../build/idreesia-mobile/bundle/main.js',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        MONGO_URL: 'mongodb://localhost:27017/idreesia-erp',
        ROOT_URL: 'https://381-mobile-server.ngrok.io',
        PORT: 3001,
        METEOR_SETTINGS: {
          private: {
            jobsAppUrl: 'http://localhost:3002',
          },
        },
      },
    },
    {
      name: 'Idreesia-Jobs',
      script: 'node ../build/idreesia-jobs/bundle/main.js',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        MONGO_URL: 'mongodb://localhost:27017/idreesia-erp',
        ROOT_URL: 'http://localhost',
        PORT: 3002,
        METEOR_SETTINGS: {
          private: {
            emailProviderKey:
              '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',
          },
        },
      },
    },
  ],
};
