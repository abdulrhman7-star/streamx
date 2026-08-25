# Use lightweight official Node.js Alpine runtime
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy server code
COPY server.js ./

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run the stream proxy server
CMD ["node", "server.js"]
