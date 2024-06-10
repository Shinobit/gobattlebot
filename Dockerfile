# Nodejs
FROM node:22

WORKDIR /app

# Install the necessary system dependencies for canvas.js
# https://www.npmjs.com/package/canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

RUN npm rebuild canvas

CMD ["node", "--env-file=.env", "./src/index.js"]
