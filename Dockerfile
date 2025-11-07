# Use an official Node.js runtime as the base image
FROM node:lts-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to install dependencies
COPY ["package.json", "package-lock.json*", "./"]

# Install all dependencies (including dev dependencies)
RUN npm install --silent

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy the rest of the application files
COPY src ./src

# Build the TypeScript code
RUN npm run build

# Remove dev dependencies to keep the image lightweight
RUN npm prune --production

# --------------------------------------------
# Create a lightweight production image
# --------------------------------------------
FROM node:lts-alpine

WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production

# Copy only necessary files from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src/graphql/schema/*.graphql ./dist/graphql/schema/

# Change ownership and switch to non-root user
RUN chown -R node /usr/src/app
USER node

# Expose the port the server runs on
EXPOSE 4000

# Health check to verify the GraphQL server is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/graphql?query={__typename}', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Command to start the server
CMD ["node", "dist/server.js"]
