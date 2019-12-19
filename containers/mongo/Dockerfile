FROM mongo:4.2.2
EXPOSE 27017
ENV TZ=Asia/Karachi
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
ENTRYPOINT ["docker-entrypoint.sh", "mongod"]
