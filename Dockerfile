FROM node:22.5.1-alpine

RUN ["mkdir", "/app"]

WORKDIR /app

COPY package.json /app

RUN ["npm", "install"]

COPY . .

EXPOSE 3003

CMD ["node", "start"]