# Backend Dockerfile

FROM node:24-slim                               

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
# RUN apt-get update && apt-get install -y default-mysql-client

EXPOSE 3000

CMD ["npm", "start"]
