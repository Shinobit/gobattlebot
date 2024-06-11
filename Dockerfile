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

# The libjpeg.so.8 package may not be available in the current Docker configuration.
# We install it manually to satisfy canvas.js dependencies.
RUN wget http://mirrors.kernel.org/ubuntu/pool/main/libj/libjpeg-turbo/libjpeg-turbo8_2.1.2-0ubuntu1_amd64.deb  
RUN apt install -y ./libjpeg-turbo8_2.1.2-0ubuntu1_amd64.deb

COPY package*.json ./

#RUN npm install npm@latest
RUN npm install --build-from-source

COPY . .

#RUN npm rebuild canvas --build-from-source

CMD ["node", "--env-file=.env", "./src/index.js"]
