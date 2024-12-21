FROM node:alpine

WORKDIR /app
USER spring:spring
COPY package.json .
RUN npm i -f
RUN npm run build
RUN rm -rf /usr/share/nginx/html/*
COPY build/* /usr/share/nginx/html

#Temporary remove ip & port hard set

#ARG DEFAULT_BACKEND_URL=localhost
#ARG DEFAULT_BACKEND_PORT=8080
#
#ENV REACT_APP_BACKEND_URL=${DEFAULT_BACKEND_URL} \
#    REACT_APP_BACKEND_PORT=${DEFAULT_BACKEND_PORT}




