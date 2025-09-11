# Stage 1: Build with Node and pnpm
FROM node:20

WORKDIR /app

# Copy dependency lock files first for cache efficiency
COPY package.json ./

# Install pnpm globally
RUN npm install -g pnpm

# Copy all project files (excluding what's in .dockerignore)
COPY . .

# Install dependencies and build
RUN pnpm install

# Expose app port
EXPOSE 6000

# Run your app using Node
CMD ["node", "server.js"]