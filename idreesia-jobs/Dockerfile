FROM node:14.18.3
EXPOSE 3002
ENV TZ=Asia/Karachi
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN npm install -g pm2
WORKDIR /idreesia-jobs
COPY ./ecosystem.config.js .
COPY ./build .
WORKDIR /idreesia-jobs/bundle/programs/server
RUN npm install
WORKDIR /idreesia-jobs
ENTRYPOINT ["pm2-runtime", "start", "ecosystem.config.js"]
