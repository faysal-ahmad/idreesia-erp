FROM nginx:1.19.1
EXPOSE 80
COPY nginx.conf /etc/nginx/nginx.conf
ENV TZ=Asia/Karachi
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
