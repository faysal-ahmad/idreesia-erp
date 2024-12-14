FROM mongo-express:1.0.2-20-alpine3.19
EXPOSE 8081
ENV TZ=Asia/Karachi
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone