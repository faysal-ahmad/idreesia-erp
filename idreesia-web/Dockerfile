FROM node:8.15.1
WORKDIR /idreesia-web
COPY ./build .
WORKDIR /idreesia-web/bundle/programs/server
RUN npm install
EXPOSE 3000
ENTRYPOINT ["node", "/idreesia-web/bundle/main.js"]
