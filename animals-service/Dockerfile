FROM node:12.16.2-alpine3.9 

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD  ["ls", "-a"]