# Development stage
FROM node:20-slim AS develop

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port (Vite default is often 5173, but project uses 4200)
EXPOSE 4200

# Start dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Production/Build stage
FROM node:20-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Nginx stage for serving production build
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
# If there's an nginx config, we'd copy it here
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
