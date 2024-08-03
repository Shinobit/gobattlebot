const {EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle} = require("discord.js");
const {is_my_developer, restrict_text, format_score, format_score_with_commas, get_level, get_level_to_emojis, application_emoji_cache} = require("../utils.js");
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
    subcommand.setName("info");
	subcommand.setDescription("Get general information about a user.");
    subcommand.addNumberOption((option) => {
        option.setName("user_id");
        option.setDescription("The user identifier.");
        option.setMinValue(1);
        option.setRequired(true);

        return option;
    });

    return subcommand;
});
user_command.addSubcommand((subcommand) => {
    subcommand.setName("king");
	subcommand.setDescription("Get general information about the current king.");

    return subcommand;
});
user_command.addSubcommand((subcommand) => {
    subcommand.setName("bank");
	subcommand.setDescription("Get the list of items contained in a game user's bank.");

    subcommand.addNumberOption((option) => {
        option.setName("user_id");
        option.setDescription("The user identifier.");
        option.setMinValue(1);
        option.setRequired(true);

        return option;
    });

    subcommand.addNumberOption((option) => {
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

    subcommand.addNumberOption((option) => {
        option.setName("user_id");
        option.setDescription("The user identifier.");
        option.setMinValue(1);
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
        subcommand.addNumberOption((option) => {
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
        subcommand.addNumberOption((option) => {
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
        subcommand.addNumberOption((option) => {
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
        subcommand.addNumberOption((option) => {
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
        subcommand.addNumberOption((option) => {
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
            case "login":
                await get_login(interaction, client);
                break;
            case "logout":
                await get_logout(interaction, client);
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
            await interaction.reply("This subcommand is under development.");
            break;
        case "accepte":
            await interaction.reply("This subcommand is under development.");
            break;
        case "ignore":
            await interaction.reply("This subcommand is under development.");
            break;
        default:
            await interaction.reply(`Invalid subcommand.\nContact ${client.application.owner} to resolve this issue.`);
    }
}

async function get_login(interaction, client){
    const gobattle_user_id = database.discord_user_to_gobattle_user_id(interaction.user);
    if (gobattle_user_id){
        interaction.reply({content: `You are already using user account _#${gobattle_user_id}_. Use the \`/user logout\` command before registering another account.`, ephemeral: true});
        return;
    }

    const modal = new ModalBuilder();
	modal.setCustomId("login");
	modal.setTitle("Login to Gobattle account.");

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

async function get_logout(interaction, client){
    const succes = database.remove_gobattle_accesse(interaction.user);

    if (succes){
        await interaction.reply({content: "Your session has ended and has been successfully deleted. You can reconnect at any time with `/user login`.", ephemeral: true});
    }else{
        await interaction.reply({content: "You do not have a registered session.", ephemeral: true});
    }
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
            await interaction.editReply(`User _#${user_id}_ session is unknown to me or has expired. The user must log in to their account with \`/user login\`.`);
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

        embed.addFields(
            {name: "> 🏷️ __ID__", value: `> ${data.user.id}`, inline: true},
            {name: "> 🪙 __Coins__", value: `> ${format_score_with_commas(data.user.coins)}`, inline: true},
            {name: "> 💎 __Diamonds__", value: `> ***${format_score_with_commas(data.user.diamonds)}***`, inline: true}
        );

        embed.addFields(
            {name: "> 💪 __LVL__", value: `> ${format_score_with_commas(level)}`, inline: true},
            {name: "> 🔥 __EXP__", value: `> ${format_score_with_commas(data.user.experience)}`, inline: true},
            {name: "> 🎖 __Role__", value: `> ${data.user.streamer ? `${streamer_emoji} Streamer` : "Player"}`, inline: true}
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

        embed.addFields(
            {name: "> ⚔️ __ATT__", value: `> **${formatted_attack}** _(Base: ${formatted_base_attack}, Equipped: ${formatted_equipped_attack})_`, inline: true},
            {name: "> 🛡️ __DEF__", value: `> **${formatted_defense}** _(Base: ${formatted_base_defense}, Equipped: ${formatted_equipped_defense})_`, inline: true},
            {name: "> 🍀 __LCK__", value: `> **${formatted_luck}** _(Base: ${formatted_base_luck}, Equipped: ${formatted_equipped_luck})_`, inline: true}
        );

        embed.addFields(
            {name: "> ❤️ __MHP__", value: `> **${formatted_hp}** _(Base: ${formatted_base_hp}, Equipped: ${formatted_equipped_hp})_`, inline: true},
            {name: "> ❤️‍🩹 __RGN__", value: `> **${formatted_regeneration}** _(Base: ${formatted_base_regeneration}, Equipped: ${formatted_equipped_regeneration})_`, inline: true},
            {name: "> ⚡ __SPD__", value: `> **${formatted_speed}** _(Base: ${formatted_base_speed}, Equipped: ${formatted_equipped_speed})_`, inline: true}
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

async function get_king(interaction, client){
    await interaction.reply("This subcommand is currently under development. You cannot use it at the moment.");
}

async function get_bank(interaction, client){
    const user_id = interaction.options.get("user_id")?.value;
    await interaction.reply("This subcommand is currently under development. You cannot use it at the moment.");
}

async function get_inventory(interaction, client){
    const user_id = interaction.options.get("user_id")?.value;
    await interaction.reply("This subcommand is currently under development. You cannot use it at the moment.");
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
        await interaction.editReply(`User _#${user_id}_ session is unknown to me or has expired. The user must log in to their account with \`/user login\`.`);
    }

    if (!response.ok){
        await interaction.editReply(`Unable to retrieve user data. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
        return;
    }

    await interaction.editReply(`User _#${user_id}_ currently has **${data.incoming}** incoming friend requests.`);
}

async function get_friend_pending_requests(interaction, client, type){
    const user_id = interaction.options.get("user_id")?.value;

    const public = type != "incoming" || database.gobattle_user_id_to_discord_user_id(user_id)?.toString() == interaction.user.id || is_my_developer(client, interaction.user);
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
    const response = await fetch(`https://gobattle.io/api.php/v${api_version}/${gobattle_token}/friend/pending?platform=${platform}&ud=`);
    const data = await response.json();

    if (data?.error == "Invalid token"){
        await interaction.editReply(`User _#${user_id}_ session is unknown to me or has expired. The user must log in to their account with \`/user login\`.`);
    }

    if (!response.ok){
        await interaction.editReply(`Unable to retrieve user data. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
        return;
    }

    const embed = new EmbedBuilder();
    const friend_emoji = "🤝";
    embed.setTitle(`${friend_emoji} Friend ${type} requests ${friend_emoji}`);

    const requests = data[type];
    const header_description = `User _#${user_id}_ has **${requests.length}** ${type} friend requests.\n`;
    const max_items_by_pages = 7;
    const pages = new Array(Math.ceil(requests.length / max_items_by_pages));
    const unknown_head_emoji = application_emoji_cache.get("heads_item_0") || "👤";

    let current_page = -1;
    for (let i = 0; i < requests.length; i++){
        if (Math.floor(i / max_items_by_pages) != current_page){
            current_page++;
            pages[current_page] = header_description;
        }

        const field = requests[i];
        const head_data = heads_map.get(parseInt(field?.skin_head, 10));
        const head_emoji = application_emoji_cache.get(head_data?.emoji) || unknown_head_emoji;
        pages[current_page] += `* ${head_emoji} **${field?.nick ? restrict_text(field?.nick, 20) : "?"}**#${field?.id}\n`;
    }

    current_page = 1;
    embed.setDescription(pages[current_page - 1] || header_description + "***There are no items to display in this list at the moment...***");

    const nb_pages = pages.length || 1;

    embed.setFooter({text: `Page ${current_page}/${nb_pages}`});
    embed.setTimestamp();

    const previous_button = new ButtonBuilder();
    previous_button.setCustomId("previous");
    previous_button.setEmoji("◀️");
    previous_button.setStyle(ButtonStyle.Primary);
    previous_button.setDisabled(current_page == 1);

    const next_button = new ButtonBuilder();
    next_button.setCustomId("next");
    next_button.setEmoji("▶️");
    next_button.setStyle(ButtonStyle.Primary);
    next_button.setDisabled(current_page == nb_pages);

    const row = new ActionRowBuilder();
    row.addComponents(previous_button, next_button);

    const response_interaction = await interaction.editReply({
        embeds: [embed],
        components: [row]
    });

    function collector_filter(m){
        const result = m.user.id == interaction.user.id;
    
        if (!result){
            m.reply({content: "You cannot interact with a command that you did not initiate yourself.", ephemeral: true}).catch((error) => {
                console.error(error);
            });
        }
    
        return result;
    }

    async function button_interaction_logic(response_interaction){
        try{
            const confirmation = await response_interaction.awaitMessageComponent({filter: collector_filter, componentType: ComponentType.Button, time: 60_000});

            if (confirmation.customId === "previous"){
                current_page--;
            } else if (confirmation.customId === "next"){
                current_page++;
            }

            embed.setDescription(pages[current_page - 1]);
            embed.setFooter({text: `Page ${current_page}/${nb_pages}`});
            previous_button.setDisabled(current_page == 1);
            next_button.setDisabled(current_page == nb_pages);

            response_interaction = await confirmation.update({embeds: [embed], components: [row]});
            await button_interaction_logic(response_interaction);
        }catch (_error){
            await interaction.editReply({content: "-# ⓘ This interaction has expired, please use the command again to be able to navigate the list.", components: []});
        }
    }

    await button_interaction_logic(response_interaction);
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
        await interaction.editReply(`User _#${user_id}_ session is unknown to me or has expired. The user must log in to their account with \`/user login\`.`);
    }

    if (!response.ok){
        await interaction.editReply(`Unable to retrieve user data. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
        return;
    }

    const embed = new EmbedBuilder();
    const friend_emoji = "🤝";
    embed.setTitle(`${friend_emoji} Friends list ${friend_emoji}`);

    const header_description = `User _#${user_id}_ has **${data.length}/100** friends.\n`;
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
            pages[current_page] = header_description;
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

    current_page = 1;
    embed.setDescription(pages[current_page - 1] || header_description + "***There are no items to display in this list at the moment...***");

    const nb_pages = pages.length || 1;

    embed.setFooter({text: `Page ${current_page}/${nb_pages}`});
    embed.setTimestamp();

    const previous_button = new ButtonBuilder();
    previous_button.setCustomId("previous");
    previous_button.setEmoji("◀️");
    previous_button.setStyle(ButtonStyle.Primary);
    previous_button.setDisabled(current_page == 1);

    const next_button = new ButtonBuilder();
    next_button.setCustomId("next");
    next_button.setEmoji("▶️");
    next_button.setStyle(ButtonStyle.Primary);
    next_button.setDisabled(current_page == nb_pages);

    const row = new ActionRowBuilder();
    row.addComponents(previous_button, next_button);

    const response_interaction = await interaction.editReply({
        embeds: [embed],
        components: [row]
    });

    function collector_filter(m){
        const result = m.user.id == interaction.user.id;
    
        if (!result){
            m.reply({content: "You cannot interact with a command that you did not initiate yourself.", ephemeral: true}).catch((error) => {
                console.error(error);
            });
        }
    
        return result;
    }

    async function button_interaction_logic(response_interaction){
        try{
            const confirmation = await response_interaction.awaitMessageComponent({filter: collector_filter, componentType: ComponentType.Button, time: 60_000});

            if (confirmation.customId === "previous"){
                current_page--;
            } else if (confirmation.customId === "next"){
                current_page++;
            }

            embed.setDescription(pages[current_page - 1]);
            embed.setFooter({text: `Page ${current_page}/${nb_pages}`});
            previous_button.setDisabled(current_page == 1);
            next_button.setDisabled(current_page == nb_pages);

            response_interaction = await confirmation.update({embeds: [embed], components: [row]});
            await button_interaction_logic(response_interaction);
        }catch (_error){
            await interaction.editReply({content: "-# ⓘ This interaction has expired, please use the command again to be able to navigate the list.", components: []});
        }
    }

    await button_interaction_logic(response_interaction);
}

exports.get_user = get_user;
exports.user_command = user_command;
