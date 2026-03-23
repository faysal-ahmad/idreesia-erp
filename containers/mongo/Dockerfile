FROM mongo:7.0.31
EXPOSE 27017
VOLUME /data/backup
ENV TZ=Asia/Karachi
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
ENTRYPOINT ["docker-entrypoint.sh", "mongod"]