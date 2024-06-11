# GoBattle.io Discord Bot

This Discord bot is a community project initiated by __Kuwazy#703__ and provides Discord users with utility commands related to the MMORPG [GoBattle.io](https://gobattle.io/).
The port is open to all potential contributors and is now managed by Shinobit.

-----------------

## To start the project, open the terminal in the project root and use the following command:
(Make sure you have set the environment variables correctly in the .env file.)

Assume you are on a Linux environment:

1. Install nodejs:
  > `sudo apt install -y nodejs`

2. Check the installation:
  > `node -v`
  > `npm -v`
  /!\ Note that the minimum node js version for the project must be v20. /!\

3. Install dependencies:
  > `npm install`
  (If there is a problem compiling the dependencies, use the `npm rebuild` command)
  If there are problems with installing the `canvas` dependency please follow the procedure for installing this dependency here: https://www.npmjs.com/package/canvas.

4. Start the bot.
  > `node --env-file=.env ./src/index.js`

## If you want to start the project from docker:

Suppose you already have Docker installed on your system:

1. Build the Docker image:
  > `docker-compose build`

2. Start container:
  > `docker-compose up`
