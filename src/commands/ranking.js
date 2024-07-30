const {EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, Emoji, parseEmoji} = require("discord.js");
const {restrict_text, get_level, get_level_adventurer, format_score, format_speed_run_time} = require("../utils.js");
const head_list = require("../head_list.json");

const heads_map = new Map();
for (const head_data of head_list){
    if (typeof head_data.id == "number"){
        heads_map.set(head_data.id, head_data);
    }
}

const ranking_command = new SlashCommandBuilder();
ranking_command.setName("ranking");
ranking_command.setDescription("Commands relating to rankings.");
ranking_command.addSubcommand((subcommand) => {
    subcommand.setName("king");
	subcommand.setDescription("Get King ranking");

    return subcommand;
});
ranking_command.addSubcommand((subcommand) => {
    subcommand.setName("weekly");
	subcommand.setDescription("Get Weekly ranking");

    return subcommand;
});
ranking_command.addSubcommand((subcommand) => {
    subcommand.setName("monthly");
	subcommand.setDescription("Get Monthly ranking");

    return subcommand;
});
ranking_command.addSubcommand((subcommand) => {
    subcommand.setName("overall");
	subcommand.setDescription("Get Overall (EXP) ranking");

    return subcommand;
});
ranking_command.addSubcommand((subcommand) => {
    subcommand.setName("adventurer");
	subcommand.setDescription("Get Adventurer ranking");

    return subcommand;
});
ranking_command.addSubcommand((subcommand) => {
    subcommand.setName("relichunter");
	subcommand.setDescription("Get Relic Hunter ranking");

    return subcommand;
});
ranking_command.addSubcommand((subcommand) => {
    subcommand.setName("speedrun");
	subcommand.setDescription("Get Speedrun ranking");
    subcommand.addNumberOption((option) => {
        option.setName("dungeon_id");
        option.setDescription("The dungeon identifier.");
        option.setMinValue(1);
        option.setRequired(true);

        return option;
    });

    return subcommand;
});

async function get_ranking(interaction, client){
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand){
        case "king":
            await get_king(interaction, client);
            break;
        case "weekly":
            await get_general(interaction, client, "weekly");
            break;
        case "monthly":
            await get_general(interaction, client, "monthly");
            break;
        case "overall":
            await get_general(interaction, client, "overall");
            break;
        case "adventurer":
            await get_adventurer(interaction, client);
            break;
        case "relichunter":
            await get_relic_hunter(interaction, client);
            break;
        case "speedrun":
            await get_speedrun(interaction, client);
            break;
        default:
            await interaction.reply(`Invalid subcommand.\nContact ${client.application.owner} to resolve this issue.`);
    }
}

async function get_king(interaction, client){
    await interaction.deferReply();

    try{
        const response = await fetch("https://gobattle.io/api.php/valdoranking?platform=Discord&ud=");

        if (!response.ok){
            await interaction.editReply(`Impossible to recover the ranking. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const data = await response.json();

        const embed = new EmbedBuilder();
        embed.setTitle("👑 King Ranking 👑");

        const ranking = data?.ranking;

        const header_description = "You can earn reputation points by killing enemies, bosses, completing dungeons, and killing other players in the arena.\nThe new king of Valdoran will be chosen every Sunday at midnight (UTC Time) and will earn 150 diamonds, ascend the throne, wear the crown and can use the `/coin` command.\n";
        const max_items_by_pages = 7;
        const pages = new Array(Math.ceil(ranking.length / max_items_by_pages));

        let current_page = -1;
        for (let i = 0; i < ranking.length; i++){
            if (Math.floor(i / max_items_by_pages) != current_page){
                current_page++;
                pages[current_page] = header_description;
            }

            const field = ranking[i];
            const head_data = heads_map.get(parseInt(field?.skin_head, 10));
            const emoji = new Emoji(client, parseEmoji(head_data?.emoji || "<:heads_item_0:1267602598668668949>"));
            pages[current_page] += `${i + 1}. ${emoji} **${restrict_text(field?.nick, 20)}**#${field?.id}: \`${format_score(field?.reputation)} REP\`\n`;
        }

        current_page = 1;
        embed.setDescription(pages[current_page - 1] || "***There are no items to display in this list at the moment...***");

	    embed.addFields(
            {name: "> 🗓 __Week__", value: `> ${data?.week || "_Unknown?_"}`, inline: true},
            {name: "> 🗓 __Year__", value: `> ${data?.year || "_Unknown?_"}`, inline: true}
        );

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
    }catch(error){
        await interaction.editReply(`Failed to generate King ranking...\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_general(interaction, client, type){
    await interaction.deferReply();

    try{
        const response = await fetch(`https://gobattle.io/api.php/stats/${type}?platform=Discord&ud=`);

        if (!response.ok){
            await interaction.editReply(`Impossible to recover the ranking. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const data = await response.json();

        const embed = new EmbedBuilder();

        switch (type){
            case "weekly":
                embed.setTitle("🔥 Weekly Ranking 🔥");
                break;
            case "monthly":
                embed.setTitle("🔥 Monthly Ranking 🔥");
                break;
            case "overall":
                embed.setTitle("🔥 Overall Ranking (EXP) 🔥");
                break;
            default:
                embed.setTitle("🔥 General Ranking 🔥");
        }
        
        const header_description = "";
        const max_items_by_pages = 7;
        const pages = new Array(Math.ceil(data.length / max_items_by_pages));

        let current_page = -1;
        for (let i = 0; i < data.length; i++){
            if (Math.floor(i / max_items_by_pages) != current_page){
                current_page++;
                pages[current_page] = header_description;
            }
            
            const field = data[i];
            const head_data = heads_map.get(parseInt(field?.skin_head, 10));
            const emoji = new Emoji(client, parseEmoji(head_data?.emoji || "<:heads_item_0:1267602598668668949>"));
            const exp = parseInt(field?.experience, 10);
            const level = get_level(exp);
            pages[current_page] += `${i + 1}. ${emoji} **${restrict_text(field?.nick, 20)}**: \`${format_score(field?.coins)}🪙 ${format_score(field?.kills)}🗡️ ${format_score(field?.deaths)}💀 ${format_score(field?.experience)}🛠️ ${level}💪\`\n`;
        }

        current_page = 1;
        embed.setDescription(pages[current_page - 1] || "***There are no items to display in this list at the moment...***");

        embed.addFields(
            {name: "> __Coins__", value: "> 🪙", inline: true},
            {name: "> __Kills__", value: "> 🗡️", inline: true},
            {name: "> __Deaths__", value: "> 💀", inline: true},
            {name: "> __Experience__", value: "> 🛠️", inline: true},
            {name: "> __Level__", value: "> 💪", inline: true}
        );

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
    }catch(error){
        await interaction.editReply(`Failed to generate Weekly ranking...\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_adventurer(interaction, client){
    await interaction.deferReply();

    try{
        const response = await fetch("https://gobattle.io/api.php/v1/stats/ranking/adventurer?platform=Discord&ud=");

        if (!response.ok){
            await interaction.editReply(`Impossible to recover the ranking. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const data = await response.json();

        const embed = new EmbedBuilder();

        embed.setTitle("🤠 Adventurer Ranking 🤠");

        const header_description = "";
        const max_items_by_pages = 7;
        const pages = new Array(Math.ceil(data.length / max_items_by_pages));

        let current_page = -1;
        for (let i = 0; i < data.length; i++){
            if (Math.floor(i / max_items_by_pages) != current_page){
                current_page++;
                pages[current_page] = header_description;
            }

            const field = data[i];
            const head_data = heads_map.get(parseInt(field?.skin_head, 10));
            const emoji = new Emoji(client, parseEmoji(head_data?.emoji || "<:heads_item_0:1267602598668668949>"));
            const level = get_level_adventurer(field?.score);
            pages[current_page] += `${i + 1}. ${emoji} **${restrict_text(field?.nick, 20)}**#${field?.id}: \`${format_score(field?.score)} EXP (${level} LVL)\`\n`;
        }

        current_page = 1;
        embed.setDescription(pages[current_page - 1]);

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
    }catch(error){
        await interaction.editReply(`Failed to generate Adventurer ranking...\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_relic_hunter(interaction, client){
    await interaction.deferReply();

    try{
        const response = await fetch("https://gobattle.io/api.php/v1/stats/ranking/relichunter?platform=Discord&ud=");

        if (!response.ok){
            await interaction.editReply(`Impossible to recover the ranking. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const data = await response.json();

        const embed = new EmbedBuilder();

        embed.setTitle("🏺 Relic Hunter Ranking 🏺");

        const header_description = "";
        const max_items_by_pages = 7;
        const pages = new Array(Math.ceil(data.length / max_items_by_pages));

        let current_page = -1;
        for (let i = 0; i < data.length; i++){
            if (Math.floor(i / max_items_by_pages) != current_page){
                current_page++;
                pages[current_page] = header_description;
            }

            const field = data[i];
            const head_data = heads_map.get(parseInt(field?.skin_head, 10));
            const emoji = new Emoji(client, parseEmoji(head_data?.emoji || "<:heads_item_0:1267602598668668949>"));
            const level = get_level_adventurer(field?.score);
            pages[current_page] += `${i + 1}. ${emoji} **${restrict_text(field?.nick, 20)}**#${field?.id}: \`${format_score(field?.score)} EXP (${level} LVL)\`\n`;
        }

        current_page = 1;
        embed.setDescription(pages[current_page - 1] || "***There are no items to display in this list at the moment...***");

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
    }catch(error){
        await interaction.editReply(`Failed to generate Hunter Ranking ranking...\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_speedrun(interaction, client){
    await interaction.deferReply();

    const dungeon_id = interaction.options.get("dungeon_id")?.value;

    try{
        const response = await fetch(`https://gobattle.io/api.php/v1/stats/speedrun/${dungeon_id}`);

        if (!response.ok){
            await interaction.editReply(`Map _#${dungeon_id}_ not found, try another dungeon ID.\nNormally the dungeon ID is listed in chat when you complete your speedrun.\nIf you don't see anything, you haven't used the \`/speedrun\` command correctly on GoBattle.io.`);
            return;
        }

        const data = await response.json();

        const embed = new EmbedBuilder();

        embed.setTitle(`🏁 Speedrun Ranking (${data.name || "_Unknown?_"}) 🏁`);

        const ranking = data.ranking;

        const header_description = "Do you also want to be included in the leaderboard?\nUse the \`/speedrun\` command on GoBattle.io to start a speedrun session and try to do better than the others!\n";
        const max_items_by_pages = 7;
        const pages = new Array(Math.ceil(ranking.length / max_items_by_pages));
        
        const list_size = ranking.length;
        let current_page = -1;
        for (let i = 0; i < list_size; i++){
            if (Math.floor(i / max_items_by_pages) != current_page){
                current_page++;
                pages[current_page] = header_description;
            }

            const field = ranking[i];
            const head_data = heads_map.get(parseInt(field?.skin_head, 10));
            const emoji = new Emoji(client, parseEmoji(head_data?.emoji || "<:heads_item_0:1267602598668668949>"));
            const time = format_speed_run_time(field?.time);
            pages[current_page] += `${field?.rank}. ${emoji} **${restrict_text(field?.nick, 20)}**#${field?.id}: \`${time}\`\n`;
        }

        current_page = 1;
        embed.setDescription(pages[current_page - 1] || "***There are no items to display in this list at the moment...***");

        embed.addFields(
            {name: "> 🏰 __Dungeon name__", value: `> **${data.name || "_Unknown?_"}**`, inline: true},
            {name: "> 🏷️ __Dungeon ID__", value: `> ${dungeon_id}`, inline: true}
        );
        
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
    }catch(error){
        await interaction.editReply(`Failed to generate Speedrun ranking...\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

exports.get_ranking = get_ranking;
exports.ranking_command = ranking_command;
