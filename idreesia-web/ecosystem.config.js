module.exports = {
  apps: [
    {
      name: 'Idreesia-Web',
      script: 'node ./bundle/main.js',
      autorestart: true,
      env: {
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
