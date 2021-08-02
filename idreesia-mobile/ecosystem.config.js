module.exports = {
  apps: [
    {
      name: 'Idreesia-Mobile',
      script: 'node ./bundle/main.js',
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        MONGO_URL: 'mongodb://mongo:27017/idreesia-erp',
        ROOT_URL: 'https://idreesia-erp.com',
        PORT: 3001,
        METEOR_SETTINGS: {
          private: {
            jobsAppUrl: 'http://jobs:3002',
            oAuth: {
              google: {
                clientId: "961183879263-ef96r606qqhsjvvn2vdak512693d67ca.apps.googleusercontent.com",
                secret: "VvFEISmArKNrWOXiyYY7mY9y"
              }
            }
          }
        }
      }
    }
  ]
};
