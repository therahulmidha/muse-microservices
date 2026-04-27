# Use Node image
FROM node:25

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm install

# Copy code
COPY . .

# Build TS
RUN npm run build

# Expose port
EXPOSE 3002

# Start app
CMD ["node", "dist/index.js"]