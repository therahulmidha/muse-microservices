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

# Generate the Prisma Client (creates the code inside node_modules)
RUN npx prisma generate

# Build TS
RUN npm run build

# Expose port
EXPOSE 3001

# Start app
CMD npx prisma db push && node dist/index.js