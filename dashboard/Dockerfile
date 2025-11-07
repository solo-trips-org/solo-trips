# ================== 1. Build Phase ==================
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only package files for caching
COPY package.json pnpm-lock.yaml* ./

# Install deps (frozen lockfile = exact versions)
RUN pnpm install --frozen-lockfile

# Copy all source
COPY . .

# Build Next.js in standalone mode
RUN pnpm build

# ================== 2. Run Phase ==================
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm globally (needed if you use pnpm runtime, optional otherwise)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose app port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]