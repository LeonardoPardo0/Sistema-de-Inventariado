# Imagen base: Nginx Alpine
FROM nginx:alpine

# Crear directorio de trabajo
WORKDIR /usr/share/nginx/html

# Copiar archivos HTML
COPY index.html .

# Copiar carpetas necesarias
COPY assets/ ./assets/
COPY pages/ ./pages/
COPY config/ ./config/

# Exponer puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]