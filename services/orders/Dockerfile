# catalog-service/Dockerfile
FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install

RUN npm install sqlite3
COPY . .
EXPOSE 3004
CMD ["node", "server.js"]