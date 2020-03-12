FROM node:12.16.1
EXPOSE 3000
ENV TZ=Asia/Karachi
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN npm install -g pm2
WORKDIR /idreesia-web
COPY ./ecosystem.config.js .
COPY ./build .
WORKDIR /idreesia-web/bundle/programs/server
RUN npm install
WORKDIR /idreesia-web
ENTRYPOINT ["pm2-runtime", "start", "ecosystem.config.js"]
