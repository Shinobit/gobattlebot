const {Client, Events, Partials, IntentsBitField, Routes, ActivityType, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType} = require("discord.js");
const {get_first_chat_channel, is_my_developer, update_application_emoji_cache, get_level_to_emojis, application_emoji_cache, get_info_application} = require("./utils.js");
const database = require("./database/database.js");

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
const {get_ultrarare_drop_chance, ultrarare_drop_chance_command} = require("./commands/ultrarare_drop_chance.js");

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
    leave_command,
    ultrarare_drop_chance_command
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

client.on(Events.ClientReady, async (event) => {
    database.init();

    console.log(`${event.user.tag} ready.`);

    client.user.setActivity("GoBattle.io", {type: ActivityType.Playing});

    await client.application.fetch();
    await update_application_emoji_cache(client.application);

    try{
        await client.rest.put(
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

client.on(Events.GuildCreate, async (guild) => {
    try {
        const channel = get_first_chat_channel(guild, client);

        if (channel){
            await channel.send("Hello, thank you for inviting me to this guild!\nYou can use the `/help` command to find out what I can do!");
        }
    }catch (error){
        console.error(error);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    try{
        if (interaction.isChatInputCommand()){
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
                case "get_ultrarare_drop_chance":
                    await get_ultrarare_drop_chance(interaction, client);
                    break;
                default:
                    await interaction.reply({content: "This command no longer exists.", ephemeral: true});
            }
        }else if (interaction.isModalSubmit()){
            switch (interaction.customId){
                case "create":
                    try{
                        await interaction.deferReply({ephemeral: true});

                        const email = interaction.fields.getTextInputValue("email");
                        const password = interaction.fields.getTextInputValue("password");

                        const platform = "Web";
                        const request_info = {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                            body: new URLSearchParams({
                                "email": email,
                                "password": password,
                                "trackingId": ""
                            })
                        };

                        const response = await fetch(`https://gobattle.io/api.php/register?platform=${platform}&ud=`, request_info);
                        const data = await response.json();

                        if (!response.ok){
                            switch (data?.error){
                                case "Invalid email":
                                    await interaction.editReply("# ⚠️ Account creation error\nThe email introduced is not valid. Please reenter your email.");
                                    return;
                                case "Password short or too easy":
                                    await interaction.editReply("# ⚠️ Account creation error\nYour password is too easy to guess. Please use a better password.");
                                    return;
                                case "Duplicated user":
                                    await interaction.editReply("# ⚠️ Account creation error\nEmail is already in use.");
                                    return;
                                default:
                                    await interaction.editReply(`Unable to create account. There is a problem with the GoBattle API.\nContact ${client.application.owner} to resolve this issue.`);
                            }
                            return;
                        }

                        const info = await get_info_application(client.application);
                        const tos = info?.terms_of_service_url || "https://gobattle.io/tos.html";
                        const pp = info?.privacy_policy_url || "https://www.iubenda.com/privacy-policy/8108614";
                        interaction.editReply(`Thank you for register to GoBattle.io.\nReview your Email and follow the instructions to activate your account _#${data.id}_.\nBy continuing to create your account we assume that you accept our [Terms of Use](${tos}) and our [Privacy Policy](${pp}).`);
                    }catch (error){
                        await interaction.editReply(`An internal error has occurred...\nContact ${client.application.owner} to resolve this issue.`);
                        console.error(error);
                    }
                    break;
                case "login":
                    try{
                        await interaction.deferReply({ephemeral: true});

                        const email = interaction.fields.getTextInputValue("email");
                        const password = interaction.fields.getTextInputValue("password");

                        const platform = "Web";
                        const request_info = {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                            body: new URLSearchParams({
                                "email": email,
                                "password": password
                            })
                        };

                        const response = await fetch(`https://gobattle.io/api.php/login?platform=${platform}&ud=`, request_info);
                        const data = await response.json();

                        if (!response.ok){
                            if (data?.error == "Invalid credentials"){
                                await interaction.editReply("# ⚠️ Login error\nThe email or the passworld are incorrect.");
                                return;
                            }

                            await interaction.editReply(`Unable to connect. There is a problem with the GoBattle API.\nContact ${client.application.owner} to resolve this issue.`);
                            return;
                        }

                        const success = database.add_gobattle_access(interaction.user, data.id, data.token);
                        if (success){
                            interaction.editReply("Your account has been successfully registered. You can log out at any time with `/user logout`.");
                        }else{
                            interaction.editReply("Your account is already registered. You can log out at any time with `/user logout`.");
                        }
                    }catch (error){
                        await interaction.editReply(`An internal error has occurred...\nContact ${client.application.owner} to resolve this issue.`);
                        console.error(error);
                    }
                    break;
                case "recover":
                    try{
                        await interaction.deferReply({ephemeral: true});

                        const email = interaction.fields.getTextInputValue("email");

                        const platform = "Web";
                        const request_info = {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                            body: new URLSearchParams({
                                "email": email
                            })
                        };

                        const response = await fetch(`https://gobattle.io/api.php/recover?platform=${platform}&ud=`, request_info);
                        const data = await response.json();

                        if (!response.ok){
                            if (data?.error == "Error sending email"){
                                await interaction.editReply("# ⚠️ Recovery error\nThe email is incorrect.");
                                return;
                            }

                            await interaction.editReply(`Unable to recover. There is a problem with the GoBattle API.\nContact ${client.application.owner} to resolve this issue.`);
                            return;
                        }

                        interaction.editReply(`This is the Email of the user _#${data.id}_. Let's ckeck out your email and follow instructions fer next steps. Let's play GoBattle!`);
                    }catch (error){
                        await interaction.editReply(`An internal error has occurred...\nContact ${client.application.owner} to resolve this issue.`);
                        console.error(error);
                    }
                    break;
                default:
                    await interaction.reply({content: "The form submission was not processed successfully because I am not familiar with the form.", ephemeral: true});
            }
        }
    }catch (error){
        console.error(error);
    }
});

client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot){
        return;
    }
      
    try{
        const command_info = msg.content.trim().split(" ");
        const command = command_info[0].toLowerCase();

        // Quick commands for development.
        let content = "";
        switch (command){
            case "!gb_bot_guilds":
                if (!is_my_developer(client, msg.author)){
                    await msg.reply("You do not have permission to use this command.");
                    return;
                }

                const guilds = client.guilds.cache;
                content = "# List of guilds I am in:\n\n";
                for (const guild of guilds.values()){
                    content += `* ${guild.name}: \`${guild.id}\`,\n`;
                }
                content += `(${guilds.size} Guilds)`;
                await msg.reply(content);
                
                break;
            case "!get_off_this_server":
                if (!is_my_developer(client, msg.author)){
                    await msg.reply("You do not have permission to use this command.");
                    return;
                }

                await msg.reply("Well, I'm leaving this guild because I seem to be disturbing...");
                await msg.guild.leave();
                
                break;
            case "!gb_emojis":
                if (!is_my_developer(client, msg.author)){
                    await msg.reply("You do not have permission to use this command.");
                    return;
                }

                const nb_emoji = 60;
                for (let i = 0; i < nb_emoji; i++){
                    const emojis = Array.from(application_emoji_cache.values());
                    const index = Math.floor(Math.random() * emojis.length);

                    content += `${emojis[index]}`;
                }
                await msg.reply(content);
                
                break;
            case "!gb_level_to_emojis":
                if (!is_my_developer(client, msg.author)){
                    await msg.reply("You do not have permission to use this command.");
                    return;
                }

                const level = parseInt(command_info[1] || 0, 10);
                await msg.reply(`Level ${level} is: (${get_level_to_emojis(level)})`);

                break;
            case "!gb_emoji_name":
                if (!is_my_developer(client, msg.author)){
                    await msg.reply("You do not have permission to use this command.");
                    return;
                }

                const emoji = application_emoji_cache.get(command_info[1]) || "_Unknown?_";
                await msg.reply(`The emoji is: ${emoji}`);

                break;
            case "!gb_confirm":
                if (!is_my_developer(client, msg.author)){
                    await msg.reply("You do not have permission to use this command.");
                    return;
                }
                
                const confirm_button = new ButtonBuilder();
                confirm_button.setCustomId("confirm");
                confirm_button.setLabel("Confirm");
                confirm_button.setStyle(ButtonStyle.Success);

                const cancel_button = new ButtonBuilder();
                cancel_button.setCustomId("cancel");
                cancel_button.setLabel("Cancel");
                cancel_button.setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder();
                row.addComponents(confirm_button, cancel_button);

                const response_interaction = await msg.reply({
                    content: "Hello dad, here is a confirmation message:",
                    components: [row]
                });

                const confirmation = await response_interaction.awaitMessageComponent({filter: () => {return true}, componentType: ComponentType.Button, time: 60_000});
                
                if (confirmation.customId == "confirm"){
                    await confirmation.update({content: "Confirm.", components: []});
                    return;
                }

                await confirmation.update({content: "Cancel.", components: []});

                break;
        }
    }catch (error){
        console.error(error);
    }
});
