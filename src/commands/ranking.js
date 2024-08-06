const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
const {restrict_text, get_level, get_level_adventurer, format_score, format_speed_run_time, send_embed_layout, application_emoji_cache} = require("../utils.js");
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
    subcommand.addIntegerOption((option) => {
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
        case "monthly":
        case "overall":
            await get_general(interaction, client, subcommand);
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
        const crown_emoji = application_emoji_cache.get("valdorancrown") || "👑";
        embed.setTitle(`${crown_emoji} King Ranking ${crown_emoji}`);

        const ranking = data?.ranking;

        const header_description = "You can earn reputation points by killing enemies, bosses, completing dungeons, and killing other players in the arena.\nThe new king of Valdoran will be chosen every Sunday at midnight (UTC Time) and will earn 150 diamonds, ascend the throne, wear the crown and can use the `/coin` command.";
        const max_items_by_pages = 7;
        const pages = new Array(Math.ceil(ranking.length / max_items_by_pages));
        const unknown_head_emoji = application_emoji_cache.get("heads_item_0") || "👤";

        let current_page = -1;
        for (let i = 0; i < ranking.length; i++){
            if (Math.floor(i / max_items_by_pages) != current_page){
                current_page++;
                pages[current_page] = "";
            }

            const field = ranking[i];
            const head_data = heads_map.get(parseInt(field?.skin_head, 10));
            const head_emoji = application_emoji_cache.get(head_data?.emoji) || unknown_head_emoji;
            pages[current_page] += `${i + 1}. ${head_emoji} **${restrict_text(field?.nick, 20)}**#${field?.id}: \`${format_score(field?.reputation)} REP\`\n`;
        }

	    embed.addFields(
            {name: "> 🗓 __Week__", value: `> ${data?.week || "_Unknown?_"}`, inline: true},
            {name: "> 🗓 __Year__", value: `> ${data?.year || "_Unknown?_"}`, inline: true}
        );

        embed.setTimestamp();

        await send_embed_layout(interaction, embed, pages, header_description);
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
                const weekly_emoji = application_emoji_cache.get("item_53") || "🏆";
                embed.setTitle(`${weekly_emoji} Weekly Ranking ${weekly_emoji}`);
                break;
            case "monthly":
                const monthly_emoji = application_emoji_cache.get("item_10") || "🏆";
                embed.setTitle(`${monthly_emoji} Monthly Ranking ${monthly_emoji}`);
                break;
            case "overall":
                const overall_emoji = application_emoji_cache.get("item_51") || "🏆";
                embed.setTitle(`${overall_emoji} Overall Ranking (EXP) ${overall_emoji}`);
                break;
            default:
                const general_emoji = application_emoji_cache.get("valdorancrown") || "🏆";
                embed.setTitle(`${general_emoji} General Ranking ${general_emoji}`);
        }
        
        const max_items_by_pages = 7;
        const pages = new Array(Math.ceil(data.length / max_items_by_pages));
        const unknown_head_emoji = application_emoji_cache.get("heads_item_0") || "👤";
        const kills_emoji = application_emoji_cache.get("compass_item97") || "🗡️";
        const deaths_emoji = application_emoji_cache.get("compass_item96") || "💀";
        const coins_emoji = application_emoji_cache.get("coin") || "🪙";
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
            pages[current_page] += `${i + 1}. ${head_emoji} **${restrict_text(field?.nick, 20)}**: ${coins_emoji}\`${format_score(field?.coins)}\` ${kills_emoji}\`${format_score(field?.kills)}\` ${deaths_emoji}\`${format_score(field?.deaths)}\` ${experience_emoji}\`${format_score(field?.experience)}\` ${level_emoji}\`${level}\`\n`;
        }

        embed.setTimestamp();

        await send_embed_layout(interaction, embed, pages);
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

        const max_items_by_pages = 7;
        const pages = new Array(Math.ceil(data.length / max_items_by_pages));
        const unknown_head_emoji = application_emoji_cache.get("heads_item_0") || "👤";

        let current_page = -1;
        for (let i = 0; i < data.length; i++){
            if (Math.floor(i / max_items_by_pages) != current_page){
                current_page++;
                pages[current_page] = "";
            }

            const field = data[i];
            const head_data = heads_map.get(parseInt(field?.skin_head, 10));
            const head_emoji = application_emoji_cache.get(head_data?.emoji) || unknown_head_emoji;
            const level = get_level_adventurer(field?.score);
            pages[current_page] += `${i + 1}. ${head_emoji} **${restrict_text(field?.nick, 20)}**#${field?.id}: \`${format_score(field?.score)} EXP (${level} LVL)\`\n`;
        }

        embed.setTimestamp();

        await send_embed_layout(interaction, embed, pages);
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

        const relic_hunter_emoji = application_emoji_cache.get("item_809") || "🎒";
        embed.setTitle(`${relic_hunter_emoji} Relic Hunter Ranking ${relic_hunter_emoji}`);

        const max_items_by_pages = 7;
        const pages = new Array(Math.ceil(data.length / max_items_by_pages));
        const unknown_head_emoji = application_emoji_cache.get("heads_item_0") || "👤";

        let current_page = -1;
        for (let i = 0; i < data.length; i++){
            if (Math.floor(i / max_items_by_pages) != current_page){
                current_page++;
                pages[current_page] = "";
            }

            const field = data[i];
            const head_data = heads_map.get(parseInt(field?.skin_head, 10));
            const head_emoji = application_emoji_cache.get(head_data?.emoji) || unknown_head_emoji;
            const level = get_level_adventurer(field?.score);
            pages[current_page] += `${i + 1}. ${head_emoji} **${restrict_text(field?.nick, 20)}**#${field?.id}: \`${format_score(field?.score)} EXP (${level} LVL)\`\n`;
        }

        embed.setTimestamp();

        await send_embed_layout(interaction, embed, pages);
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

        const header_description = "Do you also want to be included in the leaderboard?\nUse the \`/speedrun\` command on GoBattle.io to start a speedrun session and try to do better than the others!";
        const max_items_by_pages = 7;
        const pages = new Array(Math.ceil(ranking.length / max_items_by_pages));
        const unknown_head_emoji = application_emoji_cache.get("heads_item_0") || "👤";

        const list_size = ranking.length;
        let current_page = -1;
        for (let i = 0; i < list_size; i++){
            if (Math.floor(i / max_items_by_pages) != current_page){
                current_page++;
                pages[current_page] = "";
            }

            const field = ranking[i];
            const head_data = heads_map.get(parseInt(field?.skin_head, 10));
            const head_emoji = application_emoji_cache.get(head_data?.emoji) || unknown_head_emoji;
            const time = format_speed_run_time(field?.time);
            pages[current_page] += `${field?.rank}. ${head_emoji} **${restrict_text(field?.nick, 20)}**#${field?.id}: \`${time}\`\n`;
        }

        embed.addFields(
            {name: "> 🏰 __Dungeon name__", value: `> **${data.name || "_Unknown?_"}**`, inline: true},
            {name: "> 🏷️ __Dungeon ID__", value: `> ${dungeon_id}`, inline: true}
        );

        embed.setTimestamp();

        await send_embed_layout(interaction, embed, pages, header_description);
    }catch(error){
        await interaction.editReply(`Failed to generate Speedrun ranking...\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

exports.get_ranking = get_ranking;
exports.ranking_command = ranking_command;
