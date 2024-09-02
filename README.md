# GoBattle.io Discord Bot

This Discord bot is a community project initiated by __Kuwazy#703__ and provides Discord users with utility commands related to the MMORPG [GoBattle.io](https://gobattle.io/).
The door is open to all potential contributors. The project is now managed by Shinobit.

-----------------

## Configuration and prerequisites
- You must have a Discord app that you have previously created in the Discord Developer Portal.
- You also need to have nodejs v22 or higher installed on your server.
- You must have the application token and configure the `.env` file accordingly.

## To start the project, open a terminal at the root of the project and use the following commands:
(Make sure you have set the environment variables correctly in the `.env` file.)
The `.env` file must be created manually at the root of the project and should look like this:

```env
TOKEN = "token_discord_app"
# The GUILD_ADMIN_ID variable gives certain administrator privileges to the specified guilds.
GUILD_ADMIN_ID = ["380588354934276097"]
```

Assume you are on a Linux environment:

1. Install nodejs and npm:
```bash
sudo apt install -y nodejs
sudo apt install -y npm
```

2. Check the installation:
```bash
node -v
npm -v
```
  ⚠️ Note that the minimum node js version for the project must be v22.5.0. ⚠️

3. Install dependencies:
```bash
npm install
```

4. Start the bot.
```bash
npm start
```
OR
```bash
node --env-file=.env ./src/index.js
```

## If you want to start the project from docker:

Suppose you already have Docker installed on your system:
 
1. Build the Docker image:
```bash
sudo docker-compose build
```

2. Start container:
```bash
sudo docker-compose up
```

Brutal method to stop all containers:
```bash
sudo docker-compose down
```

## Screenshot Gallery
<p align="center">
	<img src="./screenshot_gallery/ranking_king.png">
	<img src="./screenshot_gallery/user_info.png">
	<img src="./screenshot_gallery/speedrun.png">
	<img src="./screenshot_gallery/item_ultrarare_drop.png">
	<img src="./screenshot_gallery/user_friend_list.png">
	<img src="./screenshot_gallery/info.png">
</p>
