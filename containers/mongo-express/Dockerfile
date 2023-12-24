FROM mongo-express:1.0.0-18-alpine3.18
EXPOSE 8081
ENV TZ=Asia/Karachi
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
