FROM node:8.15.1
WORKDIR /idreesia-jobs
COPY ./build .
WORKDIR /idreesia-jobs/bundle/programs/server
RUN npm install
EXPOSE 3002
ENTRYPOINT ["node", "/idreesia-jobs/bundle/main.js"]
