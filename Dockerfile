FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL=""
ARG VITE_ZALO_PHONE=""
ARG VITE_VIETMAP_STYLE_URL=""
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ZALO_PHONE=$VITE_ZALO_PHONE
ENV VITE_VIETMAP_STYLE_URL=$VITE_VIETMAP_STYLE_URL
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
