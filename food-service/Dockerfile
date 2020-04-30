FROM node:12.16.2-alpine3.9 

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

EXPOSE 5000

COPY . .

CMD ["node", "server 5000"]