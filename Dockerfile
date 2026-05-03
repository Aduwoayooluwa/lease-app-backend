# Stage 1: Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and Prisma schema
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for Nest CLI)
RUN npm ci

# Generate Prisma client for the builder
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Production Stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files and Prisma schema
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Install ONLY production dependencies to keep image size small
RUN npm ci --omit=dev

# Generate Prisma client for production
RUN npx prisma generate

# Copy the built output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the application port
EXPOSE 3001

# Automatically run Prisma database sync, then start the server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/src/main.js"]
