FROM node:20-alpine

WORKDIR /app

# Copy package.json and lockfile
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy all files
COPY . .

# Expose the port Vite uses
EXPOSE 5173

# Start Vite in dev mode, bound to all network interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
