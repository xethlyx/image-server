FROM node:14-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /usr/src/image-server

COPY package*.json ./
RUN npm i
COPY . .
RUN npm run-script build

CMD ["npm", "run-script", "start"]

EXPOSE 8880
