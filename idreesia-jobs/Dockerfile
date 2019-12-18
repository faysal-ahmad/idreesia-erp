FROM node:8.15.1
EXPOSE 3002
RUN npm install -g pm2
WORKDIR /idreesia-jobs
COPY ./ecosystem.config.js .
COPY ./build .
WORKDIR /idreesia-jobs/bundle/programs/server
RUN npm install
WORKDIR /idreesia-jobs
ENTRYPOINT ["pm2-runtime", "start", "ecosystem.config.js"]
