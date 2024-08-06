const {EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require("discord.js");
const {is_my_developer, restrict_text, format_score, format_score_with_commas, get_level, get_level_to_emojis, send_embed_layout, application_emoji_cache} = require("../utils.js");
const database = require("../database/database.js");
const head_list = require("../head_list.json");

const heads_map = new Map();
for (const head_data of head_list){
    if (typeof head_data.id == "number"){
        heads_map.set(head_data.id, head_data);
    }
}

const user_command = new SlashCommandBuilder();
user_command.setName("user");
user_command.setDescription("Command relating to users in the game.");
user_command.addSubcommand((subcommand) => {
    subcommand.setName("create");
	subcommand.setDescription("Create a GoBattle.io account.");

    return subcommand;
});
user_command.addSubcommand((subcommand) => {
    subcommand.setName("login");
	subcommand.setDescription("Log in to your GoBattle.io account.");

    return subcommand;
});
user_command.addSubcommand((subcommand) => {
    subcommand.setName("logout");
	subcommand.setDescription("Log out of your GoBattle.io account.");

    return subcommand;
});
user_command.addSubcommand((subcommand) => {
    subcommand.setName("recover");
	subcommand.setDescription("Recover a GoBattle.io account whose password you forgot.");

    return subcommand;
});
user_command.addSubcommand((subcommand) => {
    subcommand.setName("info");
	subcommand.setDescription("Get general information about a user.");
    subcommand.addIntegerOption((option) => {
        option.setName("user_id");
        option.setDescription("The user identifier.");
        option.setMinValue(1);
        option.setRequired(true);

        return option;
    });

    return subcommand;
});
/*
user_command.addSubcommand((subcommand) => {
    subcommand.setName("king");
	subcommand.setDescription("Get general information about the current king.");

    return subcommand;
});
user_command.addSubcommand((subcommand) => {
    subcommand.setName("bank");
	subcommand.setDescription("Get the list of items contained in a game user's bank.");

    subcommand.addIntegerOption((option) => {
        option.setName("user_id");
        option.setDescription("The user identifier.");
        option.setMinValue(1);
        option.setRequired(true);

        return option;
    });

    subcommand.addIntegerOption((option) => {
        option.setName("index_book");
        option.setDescription("Index of the bank book to consult.");
        option.setMinValue(1);
        option.setMaxValue(6);
        option.setRequired(true);

        return option;
    });

    return subcommand;
});
user_command.addSubcommand((subcommand) => {
    subcommand.setName("inventory");
	subcommand.setDescription("Get the list of items contained in a game user's inventory.");

    subcommand.addIntegerOption((option) => {
        option.setName("user_id");
        option.setDescription("The user identifier.");
        option.setMinValue(1);
        option.setRequired(true);

        return option;
    });

    return subcommand;
});
*/
user_command.addSubcommand((subcommand) => {
    subcommand.setName("gobattle_to_discord");
	subcommand.setDescription("Get Discord user from GoBattle user.");

    subcommand.addIntegerOption((option) => {
        option.setName("user_id");
        option.setDescription("The user identifier.");
        option.setMinValue(1);
        option.setRequired(true);

        return option;
    });

    return subcommand;
});
user_command.addSubcommand((subcommand) => {
    subcommand.setName("discord_to_gobattle");
	subcommand.setDescription("Get GoBattle user from Discord user.");

    subcommand.addUserOption((option) => {
        option.setName("user");
        option.setDescription("Discord user.");
        option.setRequired(true);

        return option;
    });

    return subcommand;
});
user_command.addSubcommandGroup((friend_command) => {
    friend_command.setName("friend");
	friend_command.setDescription("Command relating to friends in the game.");
    friend_command.addSubcommand((subcommand) => {
        subcommand.setName("pending_count");
        subcommand.setDescription("Get the number of friend requests a user has.");
        subcommand.addIntegerOption((option) => {
            option.setName("user_id");
            option.setDescription("The user identifier.");
            option.setMinValue(1);
            option.setRequired(true);
    
            return option;
        });
    
        return subcommand;
    });
    friend_command.addSubcommand((subcommand) => {
        subcommand.setName("incoming_requests");
        subcommand.setDescription("Get the list of a user's incoming friend requests.");
        subcommand.addIntegerOption((option) => {
            option.setName("user_id");
            option.setDescription("The user identifier.");
            option.setMinValue(1);
            option.setRequired(true);
    
            return option;
        });
    
        return subcommand;
    });
    friend_command.addSubcommand((subcommand) => {
        subcommand.setName("outgoing_requests");
        subcommand.setDescription("Get the list of a user's outgoing friend requests.");
        subcommand.addIntegerOption((option) => {
            option.setName("user_id");
            option.setDescription("The user identifier.");
            option.setMinValue(1);
            option.setRequired(true);
    
            return option;
        });
    
        return subcommand;
    });
    friend_command.addSubcommand((subcommand) => {
        subcommand.setName("list");
        subcommand.setDescription("Get a user's friends list.");
        subcommand.addIntegerOption((option) => {
            option.setName("user_id");
            option.setDescription("The user identifier.");
            option.setMinValue(1);
            option.setRequired(true);
    
            return option;
        });
    
        return subcommand;
    });
    friend_command.addSubcommand((subcommand) => {
        subcommand.setName("add");
        subcommand.setDescription("Send a friend request to a user.");
        subcommand.addIntegerOption((option) => {
            option.setName("user_id");
            option.setDescription("The user identifier.");
            option.setMinValue(1);
            option.setRequired(true);
    
            return option;
        });
    
        return subcommand;
    });
    friend_command.addSubcommand((subcommand) => {
        subcommand.setName("delete");
        subcommand.setDescription("Remove a user from your friends list.");
        subcommand.addIntegerOption((option) => {
            option.setName("user_id");
            option.setDescription("The user identifier.");
            option.setMinValue(1);
            option.setRequired(true);
    
            return option;
        });
    
        return subcommand;
    });
    friend_command.addSubcommand((subcommand) => {
        subcommand.setName("cancel");
        subcommand.setDescription("Cancel the friend request sent to a user.");
        subcommand.addIntegerOption((option) => {
            option.setName("user_id");
            option.setDescription("The user identifier.");
            option.setMinValue(1);
            option.setRequired(true);
    
            return option;
        });
    
        return subcommand;
    });
    friend_command.addSubcommand((subcommand) => {
        subcommand.setName("accept");
        subcommand.setDescription("Accept a friend request from a user.");
        subcommand.addIntegerOption((option) => {
            option.setName("user_id");
            option.setDescription("The user identifier.");
            option.setMinValue(1);
            option.setRequired(true);
    
            return option;
        });
    
        return subcommand;
    });
    friend_command.addSubcommand((subcommand) => {
        subcommand.setName("ignore");
        subcommand.setDescription("Ignore a friend request from a user.");
        subcommand.addIntegerOption((option) => {
            option.setName("user_id");
            option.setDescription("The user identifier.");
            option.setMinValue(1);
            option.setRequired(true);
    
            return option;
        });
    
        return subcommand;
    });

    return friend_command;
});

async function get_user(interaction, client){
    const subcommand_group = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();
    
    if (!subcommand_group){
        switch (subcommand){
            case "create":
                await get_create(interaction, client);
                break;
            case "login":
                await get_login(interaction, client);
                break;
            case "logout":
                await get_logout(interaction, client);
                break;
            case "recover":
                await get_recover(interaction, client);
                break;
            case "info":
                await get_info(interaction, client);
                break;
            case "king":
                await get_king(interaction, client);
                break;
            case "bank":
                await get_bank(interaction, client);
                break;
            case "inventory":
                await get_inventory(interaction, client);
                break;
            case "gobattle_to_discord":
                await get_gobattle_to_discord(interaction, client);
                break;
            case "discord_to_gobattle":
                await get_discord_to_gobattle(interaction, client);
                break;
            default:
                await interaction.reply(`Invalid subcommand.\nContact ${client.application.owner} to resolve this issue.`);
        }
    }else if (subcommand_group == "friend"){
        await get_friend(interaction, client);
    }else{
        await interaction.reply(`Invalid subcommand group.\nContact ${client.application.owner} to resolve this issue.`);
    }
}

async function get_friend(interaction, client){
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand){
        case "pending_count":
            await get_friend_pending_count(interaction, client);
            break;
        case "incoming_requests":
            await get_friend_pending_requests(interaction, client, "incoming");
            break;
        case "outgoing_requests":
            await get_friend_pending_requests(interaction, client, "outgoing");
            break;
        case "list":
            await get_friend_list(interaction, client);
            break;
        case "add":
            await get_friend_add(interaction, client);
            break;
        case "delete":
            await get_friend_delete(interaction, client);
            break;
        case "cancel":
            await get_friend_cancel(interaction, client);
            break;
        case "accept":
            await get_friend_accept(interaction, client);
            break;
        case "ignore":
            await get_friend_ignore(interaction, client);
            break;
        default:
            await interaction.reply(`Invalid subcommand.\nContact ${client.application.owner} to resolve this issue.`);
    }
}

async function get_create(interaction, _client){
    const modal = new ModalBuilder();
	modal.setCustomId("create");
	modal.setTitle("Create a GoBattle.io account.");

    const email_input = new TextInputBuilder();
    email_input.setCustomId("email");
    email_input.setLabel("Email");
    email_input.setStyle(TextInputStyle.Short);
    email_input.setRequired(true);

    const password_input = new TextInputBuilder();
    password_input.setCustomId("password");
    password_input.setLabel("Password (Don't give Discord password!)");
    password_input.setStyle(TextInputStyle.Short);
    email_input.setRequired(true);

    const email_action_row = new ActionRowBuilder().addComponents(email_input);
	const password_action_row = new ActionRowBuilder().addComponents(password_input);

    modal.addComponents(email_action_row, password_action_row);

    await interaction.showModal(modal);
}

async function get_login(interaction, _client){
    const gobattle_user_id = database.discord_user_to_gobattle_user_id(interaction.user);
    if (gobattle_user_id){
        interaction.reply({content: `You are already using user account _#${gobattle_user_id}_. Use the \`/user logout\` command before registering another account.`, ephemeral: true});
        return;
    }

    const modal = new ModalBuilder();
	modal.setCustomId("login");
	modal.setTitle("Login to GoBattle.io account.");

    const email_input = new TextInputBuilder();
    email_input.setCustomId("email");
    email_input.setLabel("Email (Used on GoBattle.io)");
    email_input.setStyle(TextInputStyle.Short);
    email_input.setRequired(true);

    const password_input = new TextInputBuilder();
    password_input.setCustomId("password");
    password_input.setLabel("Password (Don't give Discord password!)");
    password_input.setStyle(TextInputStyle.Short);
    email_input.setRequired(true);

    const email_action_row = new ActionRowBuilder().addComponents(email_input);
	const password_action_row = new ActionRowBuilder().addComponents(password_input);

    modal.addComponents(email_action_row, password_action_row);

    await interaction.showModal(modal);
}

async function get_logout(interaction, _client){
    const succes = database.remove_gobattle_accesse_by_discord_user(interaction.user);

    if (succes){
        await interaction.reply({content: "Your session has ended and has been successfully deleted. You can reconnect at any time with `/user login`.", ephemeral: true});
    }else{
        await interaction.reply({content: "You do not have a registered session.", ephemeral: true});
    }
}

async function get_recover(interaction, _client){
    const modal = new ModalBuilder();
	modal.setCustomId("recover");
	modal.setTitle("Recover your GoBattle.io account.");

    const email_input = new TextInputBuilder();
    email_input.setCustomId("email");
    email_input.setLabel("Email (Used on GoBattle.io)");
    email_input.setStyle(TextInputStyle.Short);
    email_input.setRequired(true);

    const email_action_row = new ActionRowBuilder().addComponents(email_input);

    modal.addComponents(email_action_row);

    await interaction.showModal(modal);
}

async function get_info(interaction, client){
    await interaction.deferReply();

    try{
        const user_id = interaction.options.get("user_id")?.value;
        const public = true;
        
        const gobattle_token = database.get_gobattle_token_by_gobattle_id(user_id);
        if (!gobattle_token){
            await interaction.editReply(`User _#${user_id}_ session is unknown to me or has expired. The user must log in to their account with \`/user login\`.`);
            return;
        }

        if (!public){
            await interaction.editReply(`Sorry, user _#${user_id}_ does not wish to expose this information to the public.`);
            return;
        }

        const server_version = 115;
        const platform = "Web";
        const response = await fetch(`https://gobattle.io/api.php/bootstrap/${server_version}/${gobattle_token}?platform=${platform}&ud=`);
        const data = await response.json();

        if (data?.error == "Invalid token"){
            database.remove_gobattle_accesse_by_gobattle_user_id(user_id);
            await interaction.editReply(`User _#${user_id}_ session is unknown to me or has expired. The user must log in to their account with \`/user login\`.`);
            return;
        }

        if (!response.ok){
            await interaction.editReply(`Unable to retrieve user data. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const embed = new EmbedBuilder();

        const unknown_head_emoji = application_emoji_cache.get("heads_item_0") || "👤";
        const streamer_emoji = application_emoji_cache.get("compass_item122") || "🔴";
        const head_data = heads_map.get(data.user.skin_head);
        const head_emoji = application_emoji_cache.get(head_data?.emoji) || unknown_head_emoji;

        embed.setTitle(`${head_emoji} ${data.user.streamer ? `${streamer_emoji} ` : ""}**${restrict_text(data.user.nick, 60)}**#${data.user.id}`);
        if (typeof head_emoji != "string"){
            embed.setThumbnail(head_emoji.imageURL());
        }

        const level = get_level(data.user.experience);
        embed.setDescription(`${get_level_to_emojis(Math.min(level, 2000))}\n${restrict_text("_This user has no description..._", 250)}`);
        embed.setColor(0x500000);

        const id_emoji = application_emoji_cache.get("item_348") || "🏷️";
        const coins_emoji = application_emoji_cache.get("coin") || "🪙";
        const diamonds_emoji = "💎";
        const level_emoji = application_emoji_cache.get("compass_item121") || "💪";
        const experience_emoji = application_emoji_cache.get("fuego") || "🔥";
        const role_emoji = application_emoji_cache.get("item_36") || "🎖";

        embed.addFields(
            {name: `> ${id_emoji} __Identifier__`, value: `> ${data.user.id}`, inline: true},
            {name: `> ${coins_emoji} __Coins__`, value: `> ${format_score_with_commas(data.user.coins)}`, inline: true},
            {name: `> ${diamonds_emoji} __Diamonds__`, value: `> ***${format_score_with_commas(data.user.diamonds)}***`, inline: true}
        );

        embed.addFields(
            {name: `> ${level_emoji} __Level__`, value: `> ${format_score_with_commas(level)}`, inline: true},
            {name: `> ${experience_emoji} __Experience__`, value: `> ${format_score_with_commas(data.user.experience)}`, inline: true},
            {name: `> ${role_emoji} __Role__`, value: `> ${data.user.streamer ? `${streamer_emoji} Streamer` : "Player"}`, inline: true}
        );

        const equipped_attack = data.user.attack - data.user.base_attack;
        const equipped_defense = data.user.defense - data.user.base_defense;
        const equipped_luck = data.user.luck - data.user.base_luck;
        const equipped_hp = data.user.hp -  data.user.base_hp;
        const equipped_regeneration = data.user.regeneration - data.user.base_regeneration;
        const equipped_speed = data.user.speed - data.user.base_speed;

        const formatted_attack = data.user.attack > 0 ? "+" + data.user.attack : data.user.attack;
        const formatted_defense = data.user.defense > 0 ? "+" + data.user.defense : data.user.defense;
        const formatted_luck = data.user.luck > 0 ? "+" + data.user.luck : data.user.luck;
        const formatted_hp = data.user.hp > 0 ? "+" + data.user.hp : data.user.hp;
        const formatted_regeneration = data.user.regeneration > 0 ? "+" + data.user.regeneration : data.user.regeneration;
        const formatted_speed = data.user.speed > 0 ? "+" + data.user.speed : data.user.speed;
        
        const formatted_base_attack = data.user.base_attack > 0 ? "+" + data.user.base_attack : data.user.base_attack;
        const formatted_base_defense = data.user.base_defense > 0 ? "+" + data.user.base_defense : data.user.base_defense;
        const formatted_base_luck = data.user.base_luck > 0 ? "+" + data.user.base_luck : data.user.base_luck;
        const formatted_base_hp = data.user.base_hp > 0 ? "+" + data.user.base_hp : data.user.base_hp;
        const formatted_base_regeneration = data.user.base_regeneration > 0 ? "+" + data.user.base_regeneration : data.user.base_regeneration;
        const formatted_base_speed = data.user.base_speed > 0 ? "+" + data.user.base_speed : data.user.base_speed;

        const formatted_equipped_attack = equipped_attack > 0 ? "+" + equipped_attack : equipped_attack;
        const formatted_equipped_defense = equipped_defense > 0 ? "+" + equipped_defense : equipped_defense;
        const formatted_equipped_luck = equipped_luck > 0 ? "+" + equipped_luck : equipped_luck;
        const formatted_equipped_hp = equipped_hp > 0 ? "+" + equipped_hp : equipped_hp;
        const formatted_equipped_regeneration = equipped_regeneration > 0 ? "+" + equipped_regeneration : equipped_regeneration;
        const formatted_equipped_speed = equipped_speed > 0 ? "+" + equipped_speed : equipped_speed;

        const attack_emoji = application_emoji_cache.get("compass_item95") || "⚔️";
        const defense_emoji = application_emoji_cache.get("item_119") || "🛡️";
        const luck_emoji = application_emoji_cache.get("item_478") || "🍀";
        const hp_emoji = application_emoji_cache.get("heart") || "❤️";
        const regeneration_emoji = application_emoji_cache.get("item_622") || "❤️‍🩹";
        const speed_emoji = application_emoji_cache.get("item_122") || "⚡";

        embed.addFields(
            {name: `> ${attack_emoji} __ATT__`, value: `> **${formatted_attack}** _(Base: ${formatted_base_attack}, Equipped: ${formatted_equipped_attack})_`, inline: true},
            {name: `> ${defense_emoji} __DEF__`, value: `> **${formatted_defense}** _(Base: ${formatted_base_defense}, Equipped: ${formatted_equipped_defense})_`, inline: true},
            {name: `> ${luck_emoji} __LCK__`, value: `> **${formatted_luck}** _(Base: ${formatted_base_luck}, Equipped: ${formatted_equipped_luck})_`, inline: true}
        );

        embed.addFields(
            {name: `> ${hp_emoji} __MHP__`, value: `> **${formatted_hp}** _(Base: ${formatted_base_hp}, Equipped: ${formatted_equipped_hp})_`, inline: true},
            {name: `> ${regeneration_emoji} __RGN__`, value: `> **${formatted_regeneration}** _(Base: ${formatted_base_regeneration}, Equipped: ${formatted_equipped_regeneration})_`, inline: true},
            {name: `> ${speed_emoji} __SPD__`, value: `> **${formatted_speed}** _(Base: ${formatted_base_speed}, Equipped: ${formatted_equipped_speed})_`, inline: true}
        );

        /*
        embed.addFields(
            {name: "> 💯 __ADV Score__", value: `> ${"_Unknown?_"}`, inline: true},
            {name: "> 💪 __ADV LVL__", value: `> ${"_Unknown?_"}`, inline: true},
            {name: "> 🤠 __ADV Rank__", value: `> ${"_Unknown?_"}`, inline: true}
        );

        embed.addFields(
            {name: "> 🔔 __Status__", value: `> ${"_Unknown?_"}`, inline: true},
            {name: "> 🌐 __Server__", value: `> ${"_Unknown?_"}`, inline: true},
            {name: "> 🔱 __REP__", value: `> ${"_Unknown?_"}`, inline: true}
        );

        embed.addFields(
            {name: "> 🔇 __Is Muted__", value: `> ${"_Unknown?_"}`, inline: true},
            {name: "> 🚫 __Is Banned__", value: `> ${"_Unknown?_"}`, inline: true},
            {name: "> 👑 __Is King__", value: `> ${"_Unknown?_"}`, inline: true}
        );
        */

        embed.setTimestamp();

        await interaction.editReply({
            embeds: [embed]
        });
    }catch(error){
        await interaction.editReply(`Unable to retrieve information on this user.\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_king(interaction, _client){
    await interaction.reply("This subcommand is currently under development. You cannot use it at the moment.");
}

async function get_bank(interaction, _client){
    const user_id = interaction.options.get("user_id")?.value;
    await interaction.reply("This subcommand is currently under development. You cannot use it at the moment.");
}

async function get_inventory(interaction, _client){
    const user_id = interaction.options.get("user_id")?.value;
    await interaction.reply("This subcommand is currently under development. You cannot use it at the moment.");
}

async function get_gobattle_to_discord(interaction, client){
    await interaction.deferReply();

    const user_id = interaction.options.get("user_id")?.value;
    const discord_user_id = database.gobattle_user_id_to_discord_user_id(user_id);

    if (!discord_user_id){
        await interaction.editReply(`User _#${user_id}_ session is unknown to me or has expired. The user must log in to their account with \`/user login\`.`);
        return;
    }

    const user_discord_promise = client.users.fetch(discord_user_id.toString());
    user_discord_promise.then(async (user_discord) => {
        await interaction.editReply(`GoBattle account _#${user_id}_ belongs to ${user_discord}.`);
    }).catch(async (_error) => {
        await interaction.editReply(`GoBattle account _#${user_id}_ belongs to an unknown or deleted user account. The user must log in to their account with \`/user login\`.`);
    });
}

async function get_discord_to_gobattle(interaction, _client){
    await interaction.deferReply();

    const discord_user = interaction.options.get("user").user;
    const gobattle_user_id = database.discord_user_to_gobattle_user_id(discord_user);

    if (!gobattle_user_id){
        await interaction.editReply(`The GoBattle.io session for ${discord_user} is unknown to me or has expired. The user must log in to their account with \`/user login\`.`);
        return;
    }
    
    await interaction.editReply(`The Discord account ${discord_user} belongs to the GoBattle account _#${gobattle_user_id}_.`);
}

async function get_friend_pending_count(interaction, client){
    await interaction.deferReply();

    const user_id = interaction.options.get("user_id")?.value;
    const gobattle_token = database.get_gobattle_token_by_gobattle_id(user_id);

    if (!gobattle_token){
        await interaction.editReply(`User _#${user_id}_ session is unknown to me or has expired. The user must log in to their account with \`/user login\`.`);
        return;
    }

    const platform = "Web";
    const api_version = 1;
    const response = await fetch(`https://gobattle.io/api.php/v${api_version}/${gobattle_token}/friend/pending/count?platform=${platform}&ud=`);
    const data = await response.json();

    if (data?.error == "Invalid token"){
        database.remove_gobattle_accesse_by_gobattle_user_id(user_id);
        await interaction.editReply(`User _#${user_id}_ session is unknown to me or has expired. The user must log in to their account with \`/user login\`.`);
        return;
    }

    if (!response.ok){
        await interaction.editReply(`Unable to retrieve user data. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
        return;
    }

    await interaction.editReply(`User _#${user_id}_ currently has **${data.incoming}** incoming friend requests.`);
}

async function get_friend_pending_requests(interaction, client, type){
    const user_id = interaction.options.get("user_id")?.value;

    const public = type != database.gobattle_user_id_to_discord_user_id(user_id)?.toString() == interaction.user.id || is_my_developer(client, interaction.user);
    await interaction.deferReply({ephemeral: public && type == "incoming"});

    const gobattle_token = database.get_gobattle_token_by_gobattle_id(user_id);
    if (!gobattle_token){
        await interaction.editReply(`User _#${user_id}_ session is unknown to me or has expired. The user must log in to their account with \`/user login\`.`);
        return;
    }

    if (!public){
        await interaction.editReply(`Sorry, user _#${user_id}_ does not wish to expose this information to the public.`);
        return;
    }

    const platform = "Web";
    const api_version = 1;
    const response = await fetch(`https://gobattle.io/api.php/v${api_version}/${gobattle_token}/friend/pending?platform=${platform}&ud=`);
    const data = await response.json();

    if (data?.error == "Invalid token"){
        database.remove_gobattle_accesse_by_gobattle_user_id(user_id);
        await interaction.editReply(`User _#${user_id}_ session is unknown to me or has expired. The user must log in to their account with \`/user login\`.`);
        return;
    }

    if (!response.ok){
        await interaction.editReply(`Unable to retrieve user data. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
        return;
    }

    const embed = new EmbedBuilder();
    const friend_emoji = "🤝";
    embed.setTitle(`${friend_emoji} Friend ${type} requests ${friend_emoji}`);

    const requests = data[type];
    const header_description = `User _#${user_id}_ has **${requests.length}** ${type} friend requests.`;
    const max_items_by_pages = 7;
    const pages = new Array(Math.ceil(requests.length / max_items_by_pages));
    const unknown_head_emoji = application_emoji_cache.get("heads_item_0") || "👤";

    let current_page = -1;
    for (let i = 0; i < requests.length; i++){
        if (Math.floor(i / max_items_by_pages) != current_page){
            current_page++;
            pages[current_page] = "";
        }

        const field = requests[i];
        const head_data = heads_map.get(parseInt(field?.skin_head, 10));
        const head_emoji = application_emoji_cache.get(head_data?.emoji) || unknown_head_emoji;
        pages[current_page] += `* ${head_emoji} **${field?.nick ? restrict_text(field?.nick, 20) : "?"}**#${field?.id}\n`;
    }

    embed.setTimestamp();

    await send_embed_layout(interaction, embed, pages, header_description);
}

async function get_friend_list(interaction, client){
    const user_id = interaction.options.get("user_id")?.value;
    const public = database.gobattle_user_id_to_discord_user_id(user_id)?.toString() == interaction.user.id || is_my_developer(client, interaction.user);

    await interaction.deferReply({ephemeral: public});

    const gobattle_token = database.get_gobattle_token_by_gobattle_id(user_id);
    if (!gobattle_token){
        await interaction.editReply(`User _#${user_id}_ session is unknown to me or has expired. The user must log in to their account with \`/user login\`.`);
        return;
    }

    if (!public){
        await interaction.editReply(`Sorry, user _#${user_id}_ does not wish to expose this information to the public.`);
        return;
    }

    const platform = "Web";
    const api_version = 1;
    const response = await fetch(`https://gobattle.io/api.php/v${api_version}/${gobattle_token}/friend/list?platform=${platform}&ud=`);
    const data = await response.json();

    if (data?.error == "Invalid token"){
        database.remove_gobattle_accesse_by_gobattle_user_id(user_id);
        await interaction.editReply(`User _#${user_id}_ session is unknown to me or has expired. The user must log in to their account with \`/user login\`.`);
        return;
    }

    if (!response.ok){
        await interaction.editReply(`Unable to retrieve user data. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
        return;
    }

    const embed = new EmbedBuilder();
    const friend_emoji = "🤝";
    embed.setTitle(`${friend_emoji} Friends list ${friend_emoji}`);

    const header_description = `User _#${user_id}_ has **${data.length}/100** friends.`;
    const max_items_by_pages = 7;
    const pages = new Array(Math.ceil(data.length / max_items_by_pages));
    const unknown_head_emoji = application_emoji_cache.get("heads_item_0") || "👤";
    const streamer_emoji = application_emoji_cache.get("compass_item122") || "🔴";
    const experience_emoji = application_emoji_cache.get("fuego") || "🔥";
    const level_emoji = application_emoji_cache.get("compass_item121") || "🔰";
    
    let current_page = -1;
    for (let i = 0; i < data.length; i++){
        if (Math.floor(i / max_items_by_pages) != current_page){
            current_page++;
            pages[current_page] = "";
        }

        const field = data[i];
        const head_data = heads_map.get(parseInt(field?.skin_head, 10));
        const head_emoji = application_emoji_cache.get(head_data?.emoji) || unknown_head_emoji;
        const exp = parseInt(field?.experience, 10);
        const level = get_level(exp);
        /*const date = new Date(field?.ts + "Z");
        const timestamp = date.getTime() / 1000;*/
        const online_label = field?.online ? `**Online** (__*${field?.playing}*__) in __*${field?.joinFriendlyName}*__.` : "**Offline**";
        pages[current_page] += `* ${head_emoji} ${false && field?.status == 1 ? streamer_emoji : ""}**${field?.nick ? restrict_text(field?.nick, 20) : "?"}**#${field?.id}: ${online_label} ${experience_emoji}\`${format_score(field?.experience)}\` ${level_emoji}\`${level}\`\n`;
    }

    embed.setTimestamp();

    await send_embed_layout(interaction, embed, pages, header_description);
}

async function get_friend_add(interaction, client){
    await interaction.deferReply();

    try{
        const user_id = interaction.options.get("user_id")?.value;
        
        const my_gobattle_user_id = database.discord_user_to_gobattle_user_id(interaction.user);
        if (!my_gobattle_user_id){
            await interaction.editReply("Your user session is unknown to me or has expired. You must log in to your account with `/user login`.");
            return;
        }

        if (my_gobattle_user_id == user_id){
            await interaction.editReply("You cannot send yourself a friend request...");
            return;
        }

        const gobattle_token = database.get_gobattle_token_by_discord_user(interaction.user);
        if (!gobattle_token){
            await interaction.editReply("Your user session is unknown to me or has expired. You must log in to your account with `/user login`.");
            return;
        }

        const api_version = 1;
        const platform = "Web";
        const request_info = {
            method: "POST"
        };
        const response = await fetch(`https://gobattle.io/api.php/v${api_version}/${gobattle_token}/friend/request/${user_id}/add?platform=${platform}&ud=`, request_info);

        if (!response.ok){
            const data = await response.json();
            switch (data?.error){
                case "Invalid token":
                    database.remove_gobattle_accesse_by_gobattle_user_id(my_gobattle_user_id);
                    await interaction.editReply("Your user session is unknown to me or has expired. You must log in to your account with `/user login`.");
                    return;
                case "Account is already a friend":
                    await interaction.editReply(`You are already friends with user _#${user_id}_! Congratulations!`);
                    return;
                case "Error creating friend request":
                    await interaction.editReply(`User _#${user_id}_ no longer accepts friend requests.`);
                    return;
                case "Account not found":
                    await interaction.editReply(`The user _#${user_id}_ no longer exists or never existed.`);
                    return;
                case "No more requests today":
                    await interaction.editReply("You cannot send more friend requests today.");
                    return;
                default:
                    await interaction.editReply(`Unable to send a friend request to the user. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            }
            return;
        }

        const data_text = await response.text();
        if (data_text == "ok"){
            await interaction.editReply(`The friend request was sent to user _#${user_id}_.`);
        }else{
            await interaction.editReply(`You have already sent a friend request to user _#${user_id}_. Wait for him to give an answer.`);
        }
    }catch(error){
        await interaction.editReply(`Unable to retrieve information on this user.\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_friend_delete(interaction, client){
    await interaction.deferReply();

    try{
        const user_id = interaction.options.get("user_id")?.value;

        const gobattle_token = database.get_gobattle_token_by_discord_user(interaction.user);
        if (!gobattle_token){
            await interaction.editReply("Your user session is unknown to me or has expired. You must log in to your account with `/user login`.");
            return;
        }

        const api_version = 1;
        const platform = "Web";
        const request_info = {
            method: "POST"
        };
        const response = await fetch(`https://gobattle.io/api.php/v${api_version}/${gobattle_token}/friend/${user_id}/delete?platform=${platform}&ud=`, request_info);

        const data = await response.json();
        if (!response.ok){
            switch (data?.error){
                case "Invalid token":
                    database.remove_gobattle_accesse_by_discord_user(interaction.user);
                    await interaction.editReply("Your user session is unknown to me or has expired. You must log in to your account with `/user login`.");
                    return;
                default:
                    await interaction.editReply(`Unable to remove user _#${user_id}_ from friends list. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            }
            return;
        }
        
        if (data == "ok"){
            await interaction.editReply(`The user _#${user_id}_ has been deleted from the friends list.`);
        }else{
            await interaction.editReply(`The user _#${user_id}_ is already not present in your friends list.`);
        }
    }catch(error){
        await interaction.editReply(`Unable to retrieve information on this user.\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_friend_cancel(interaction, client){
    await interaction.deferReply();

    try{
        const user_id = interaction.options.get("user_id")?.value;

        const gobattle_token = database.get_gobattle_token_by_discord_user(interaction.user);
        if (!gobattle_token){
            await interaction.editReply("Your user session is unknown to me or has expired. You must log in to your account with `/user login`.");
            return;
        }

        const api_version = 1;
        const platform = "Web";
        const request_info = {
            method: "POST"
        };
        const response = await fetch(`https://gobattle.io/api.php/v${api_version}/${gobattle_token}/friend/request/${user_id}/delete?platform=${platform}&ud=`, request_info);

        const data = await response.json();
        if (!response.ok){
            switch (data?.error){
                case "Invalid token":
                    database.remove_gobattle_accesse_by_discord_user(interaction.user);
                    await interaction.editReply("Your user session is unknown to me or has expired. You must log in to your account with `/user login`.");
                    return;
                default:
                    await interaction.editReply(`Unable to cancel friend request sent to user _#${user_id}_. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            }
            return;
        }
        
        if (data == "ok"){
            await interaction.editReply(`The friend request sent to user _#${user_id}_ was canceled.`);
        }else{
            await interaction.editReply(`The friend request sent to user _#${user_id}_ has already been canceled.`);
        }
    }catch(error){
        await interaction.editReply(`Unable to retrieve information on this user.\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_friend_accept(interaction, client){
    await interaction.deferReply();

    try{
        const user_id = interaction.options.get("user_id")?.value;

        const gobattle_token = database.get_gobattle_token_by_discord_user(interaction.user);
        if (!gobattle_token){
            await interaction.editReply("Your user session is unknown to me or has expired. You must log in to your account with `/user login`.");
            return;
        }

        const api_version = 1;
        const platform = "Web";
        const request_info = {
            method: "POST"
        };
        const response = await fetch(`https://gobattle.io/api.php/v${api_version}/${gobattle_token}/friend/request/${user_id}/accept?platform=${platform}&ud=`, request_info);

        const data = await response.json();
        if (!response.ok){
            switch (data?.error){
                case "Invalid token":
                    database.remove_gobattle_accesse_by_discord_user(interaction.user);
                    await interaction.editReply("Your user session is unknown to me or has expired. You must log in to your account with `/user login`.");
                    return;
                case "Error accepting request":
                    await interaction.editReply(`You have reached the limit on the number of possible friends or the user _#${user_id}_ has reached his limit on the number of friends or is no longer accepting new friends.`);
                    return;
                default:
                    await interaction.editReply(`Unable to accept friend request for user _#${user_id}_. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            }
            return;
        }
        
        if (data == "ok"){
            await interaction.editReply(`The friend request for user _#${user_id}_ has been accepted.`);
        }else{
            await interaction.editReply(`You have already accepted the friend request from user _#${user_id}_.`);
        }
    }catch(error){
        await interaction.editReply(`Unable to retrieve information on this user.\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_friend_ignore(interaction, client){
    await interaction.deferReply();

    try{
        const user_id = interaction.options.get("user_id")?.value;

        const gobattle_token = database.get_gobattle_token_by_discord_user(interaction.user);
        if (!gobattle_token){
            await interaction.editReply("Your user session is unknown to me or has expired. You must log in to your account with `/user login`.");
            return;
        }

        const api_version = 1;
        const platform = "Web";
        const request_info = {
            method: "POST"
        };
        const response = await fetch(`https://gobattle.io/api.php/v${api_version}/${gobattle_token}/friend/request/${user_id}/ignore?platform=${platform}&ud=`, request_info);

        const data = await response.json();
        if (!response.ok){
            switch (data?.error){
                case "Invalid token":
                    database.remove_gobattle_accesse_by_discord_user(interaction.user);
                    await interaction.editReply("Your user session is unknown to me or has expired. You must log in to your account with `/user login`.");
                    return;
                default:
                    await interaction.editReply(`Unable to ignore friend request for user _#${user_id}_. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            }
            return;
        }
        
        if (data == "ok"){
            await interaction.editReply(`The friend request for user _#${user_id}_ has been ignored.`);
        }else{
            await interaction.editReply(`The friend request for user _#${user_id}_ has already been ignored.`);
        }
    }catch(error){
        await interaction.editReply(`Unable to retrieve information on this user.\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

exports.get_user = get_user;
exports.user_command = user_command;
