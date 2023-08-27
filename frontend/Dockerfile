FROM node:lts-alpine AS build

ARG VITE_APP_BASE_URL
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ARG VITE_APP_URL

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build-only

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
