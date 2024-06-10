const {Client, Partials, IntentsBitField, Routes, ActivityType} = require("discord.js");
const {get_random_int, get_first_chat_channel} = require("./utils.js");
const sentences = require("./sentences.json");

const {get_ranking, ranking_command} = require("./commands/ranking.js");
const {get_help, help_command} = require("./commands/help.js");
const {get_asset, asset_command} = require("./commands/asset.js");
const {get_item, item_command} = require("./commands/item.js");
const {get_user, user_command} = require("./commands/user.js");
const {get_server, server_command} = require("./commands/server.js");
const {get_info, info_command} = require("./commands/info.js");
const {get_dungeon, dungeon_command} = require("./commands/dungeon.js");
const {get_date_new_king, date_new_king_command} = require("./commands/date_new_king.js");
const {get_ping, ping_command} = require("./commands/ping.js");
const {get_leave, leave_command} = require("./commands/leave.js");
const {get_setting, setting_command} = require("./commands/setting.js");
const {get_echo, echo_command} = require("./commands/echo.js");

const global_commands = [
    ranking_command,
    help_command,
    asset_command,
    item_command,
    user_command,
    server_command,
    info_command,
    dungeon_command,
    date_new_king_command,
    ping_command,
    leave_command
];

const private_commands = [
    setting_command,
    echo_command
];

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildEmojisAndStickers
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.login(process.env.TOKEN);

client.on("ready", async (event) => {
    console.log(`${event.user.tag} ready.`);

    client.user.setActivity("GoBattle.io", {type: ActivityType.Playing});

    await client.application.fetch();

    try{
        client.rest.put(
            Routes.applicationCommands(client.user.id),
            {body: global_commands}
        );
    }catch (error){
        console.error(error);
    }

    const guilds_admin_id = JSON.parse(process.env.GUILD_ADMIN_ID);
    for (const guild_id of guilds_admin_id){
        try{
            await client.rest.put(
                Routes.applicationGuildCommands(client.user.id, guild_id),
                {body: private_commands}
            );
        }catch (error){
            console.error(error);
        }
    }
});

client.on("guildCreate", async (guild) => {
    try {
        const channel = get_first_chat_channel(guild, client);

        if (channel){
            await channel.send("Hello, thank you for inviting me to this guild!\nYou can use the `/help` command to find out what I can do!");
        }
    }catch (error){
        console.error(error);
    }
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()){
        return;
    }

    if (!interaction.isChatInputCommand()){
        return;
    }

    try{
        switch (interaction.commandName){
            case "item":
                await get_item(interaction, client);
                break;
            case "user":
                await get_user(interaction, client);
                break;
            case "server":
                await get_server(interaction, client);
                break;
            case "ranking":
                await get_ranking(interaction, client);
                break;
            case "get_date_new_king":
                await get_date_new_king(interaction, client);
                break;
            case "info":
                await get_info(interaction, client);
                break;
            case "help":
                await get_help(interaction, client);
                break;
            case "ping":
                await get_ping(interaction, client);
                break;
            case "leave":
                await get_leave(interaction, client);
                break;
            case "asset":
                await get_asset(interaction, client);
                break;
            case "dungeon":
                await get_dungeon(interaction, client);
                break;
            case "setting":
                await get_setting(interaction, client);
                break;
            case "echo":
                await get_echo(interaction, client);
                break;
            default:
                await interaction.reply({content: "This command no longer exists.", ephemeral: true});
        }
    }catch (error){
        console.error("Impossible to answer:", error);
    }
});

client.on("messageCreate", async (msg) => {
    if (msg.author.bot){
        return;
    }

    try{
        // Adding chili pepper to the cat. It amuses us LOL.
        if (msg.mentions.has(client.user)){
            await msg.reply(sentences[get_random_int(sentences.length)]);
            return;
        }

        const command = msg.content.trim().toLowerCase();

        // Quick commands for development.
        switch (command){
            case "!gb_bot_guilds":
                if (msg.author == client.application.owner){
                    const guilds = client.guilds.cache;
                    let message = "# List of guilds I am in:\n\n";
                    let i = 0;
                    for (const guild of guilds.values()){
                        i++;
                        message += `**#${i}** ${guild.name}: \`${guild.id}\`,\n`;
                    }
                    message += `(${guilds.size} Guilds)`;
                    await msg.reply(message);
                }else{
                    await msg.reply(`You are not ${client.application.owner}, you do not have the right to use this command.`);
                }
                
                break;
        }
    }catch (error){
        console.error("Impossible to answer:", error);
    }
});