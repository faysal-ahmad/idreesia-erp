FROM node:8.15.1
EXPOSE 3000
RUN npm install -g pm2
WORKDIR /idreesia-web
COPY ./ecosystem.config.js .
COPY ./build .
WORKDIR /idreesia-web/bundle/programs/server
RUN npm install
WORKDIR /idreesia-web
ENTRYPOINT ["pm2-runtime", "start", "ecosystem.config.js"]
