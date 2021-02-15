### STAGE 1: Build ###
FROM node:14.1-alpine AS builder

WORKDIR /opt/web
COPY package.json package-lock.json ./
RUN npm install

ENV PATH="./node_modules/.bin:$PATH"

COPY . ./
RUN ng build --prod

### STAGE 2: Run ###
FROM socialengine/nginx-spa:latest
COPY --from=builder /opt/web/dist/cbnaFront /app
RUN chmod -R 777 /app
