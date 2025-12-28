# Base stage - install dependencies
FROM node:22-slim AS base
WORKDIR /usr/src/app

# Install build dependencies for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Build stage - compile TypeScript
FROM base AS build
ENV NODE_ENV=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies after build
RUN npm prune --omit=dev

# Production stage - minimal image with only compiled code
FROM node:22-slim AS production
WORKDIR /usr/src/app

ENV NODE_ENV=production \
    PORT=3000 \
    CI=true \
    HUSKY=0

# Install build dependencies for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies + tsx and typescript for migrations
RUN npm ci --omit=dev && \
    npm install --save-prod tsx typescript && \
    npm cache clean --force

# Remove build dependencies to keep image small (native modules are already compiled)
RUN apt-get update && apt-get remove -y python3 make g++ && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Copy compiled code from build stage (for server)
COPY --from=build /usr/src/app/dist ./dist

# Copy source code and tsconfig (for migrations with tsx)
COPY --from=build /usr/src/app/src ./src
COPY --from=build /usr/src/app/tsconfig.json ./tsconfig.json

# Expose port
EXPOSE 3000

# Run production server
CMD ["npm", "run", "start"]
