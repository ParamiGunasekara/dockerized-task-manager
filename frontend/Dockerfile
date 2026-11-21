
FROM nginx:alpine

COPY frontend/index.html /usr/share/nginx/html/index.html
COPY frontend/style.css /usr/share/nginx/html/style.css
COPY frontend/script.js /usr/share/nginx/html/script.js

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
