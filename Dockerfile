# Nodejs
FROM node:22

WORKDIR /app

COPY package*.json ./

# Remove any existing node_modules and package-lock.json to ensure a clean install.
RUN rm -rf node_modules package-lock.json

# Install Node.js dependencies.
RUN npm install --build-from-source

COPY . .

CMD ["node", "--env-file=.env", "./src/index.js"]
