FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Build Vite frontend static files
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime SQLite dependencies if needed
RUN apk add --no-cache sqlite

# Copy package and node_modules from builder
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src
COPY --from=builder /app/tests ./tests
COPY --from=builder /app/vite.config.js ./
COPY --from=builder /app/index.html ./

# Create data directory for persistent SQLite database
RUN mkdir -p /app/data

ENV PORT=3001
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/sql_manager.db

EXPOSE 3001

CMD ["npm", "start"]
