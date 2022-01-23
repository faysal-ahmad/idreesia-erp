FROM node:14.18.3
EXPOSE 3001
ENV TZ=Asia/Karachi
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN npm install -g pm2
WORKDIR /idreesia-mobile
COPY ./ecosystem.config.js .
COPY ./build .
WORKDIR /idreesia-mobile/bundle/programs/server
RUN npm install
WORKDIR /idreesia-mobile
ENTRYPOINT ["pm2-runtime", "start", "ecosystem.config.js"]
