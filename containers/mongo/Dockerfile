FROM mongo:4.4.18
EXPOSE 27017
VOLUME /data/backup
COPY ./scripts /scripts
ENV TZ=Asia/Karachi
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
ENTRYPOINT ["docker-entrypoint.sh", "mongod"]
