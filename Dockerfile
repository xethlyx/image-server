FROM node:14-alpine
WORKDIR /usr/src/image-server

COPY package*.json ./
RUN npm i
COPY . .

EXPOSE 8880
