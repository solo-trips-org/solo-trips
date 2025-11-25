# ================== 1. Build Phase ==================
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy full source
COPY . .

# Build Next.js (NOT standalone)
RUN pnpm build

# ================== 2. Run Phase ==================
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm globally (optional)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy node_modules from builder since we need them for non-standalone mode
COPY --from=builder /app/node_modules ./node_modules

# Copy Next.js build output
COPY --from=builder /app/.next ./.next

# Copy public folder
COPY --from=builder /app/public ./public

# Copy package.json for runtime
COPY package.json ./

# Expose port
EXPOSE 3000

# Start app (non-standalone uses next start)
CMD ["pnpm", "start"]
