module.exports = {
  apps: [
    {
      name: 'Idreesia-Jobs',
      script: 'node ./bundle/main.js',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        MONGO_URL: 'mongodb://mongo:27017/idreesia-erp',
        ROOT_URL: 'http://localhost',
        PORT: 3002,
        METEOR_SETTINGS: {
          private: {
            emailProviderKey:
              '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'
          }
        }
      }
    }
  ]
};
