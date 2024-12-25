FROM node:alpine as build

# For compiling static resources for proxy server

#WORKDIR /app
#COPY package*.json .
#RUN npm i -f
#COPY . .
#RUN npm run build
#
#FROM node:alpine
#WORKDIR /app
#COPY --from=build /app/build /build


# For starting node server at local port

WORKDIR /app
COPY package.json .
RUN npm i -f
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]



#Temporary remove ip & port hard set

#ARG DEFAULT_BACKEND_URL=localhost
#ARG DEFAULT_BACKEND_PORT=8080
#
#ENV REACT_APP_BACKEND_URL=${DEFAULT_BACKEND_URL} \
#    REACT_APP_BACKEND_PORT=${DEFAULT_BACKEND_PORT}




