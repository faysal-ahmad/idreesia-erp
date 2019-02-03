module.exports = {
  apps: [
    {
      name: "Idreesia-ERP",
      script: "node ../build/idreesia-erp/bundle/main.js",
      autorestart: true,
      env: {
        NODE_ENV: "production",
        MONGO_URL: "mongodb://localhost:27017/idreesia-erp",
        ROOT_URL: "http://192.168.1.100",
        PORT: 3000,
        METEOR_SETTINGS: {
          public: {
            graphqlServerUrl: "http://192.168.1.100:4000/graphql",
            expressServerUrl: "http://192.168.1.100:3000"
          }
        }
      }
    },
    {
      name: "Idreesia-Jobs",
      script: "node ../build/idreesia-jobs/bundle/main.js",
      autorestart: true,
      env: {
        NODE_ENV: "production",
        MONGO_URL: "mongodb://localhost:27017/idreesia-erp",
        PORT: 3002,
        METEOR_SETTINGS: {
          public: {}
        }
      }
    }
  ]
};
