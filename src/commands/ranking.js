const {EmbedBuilder, SlashCommandBuilder, AttachmentBuilder} = require("discord.js");
const {restrict_text, table, get_level, get_level_adventurer, format_score, format_speed_run_time} = require("../utils.js");

const ranking_command = new SlashCommandBuilder();
ranking_command.setName("ranking");
ranking_command.setDescription("Commands relating to rankings.");
ranking_command.addSubcommand((subcommand) => {
    subcommand.setName("king");
	subcommand.setDescription("Get King ranking");
    subcommand.addNumberOption((option) => {
        option.setName("max_fields");
        option.setDescription("Maximum number of fields.");
        option.setMinValue(1);
        option.setMaxValue(50);
        option.setRequired(false);

        return option;
    });

    return subcommand;
});
ranking_command.addSubcommand((subcommand) => {
    subcommand.setName("weekly");
	subcommand.setDescription("Get Weekly ranking");
    subcommand.addNumberOption((option) => {
        option.setName("max_fields");
        option.setDescription("Maximum number of fields.");
        option.setMinValue(1);
        option.setMaxValue(50);
        option.setRequired(false);

        return option;
    });

    return subcommand;
});
ranking_command.addSubcommand((subcommand) => {
    subcommand.setName("monthly");
	subcommand.setDescription("Get Monthly ranking");
    subcommand.addNumberOption((option) => {
        option.setName("max_fields");
        option.setDescription("Maximum number of fields.");
        option.setMinValue(1);
        option.setMaxValue(50);
        option.setRequired(false);

        return option;
    });

    return subcommand;
});
ranking_command.addSubcommand((subcommand) => {
    subcommand.setName("overall");
	subcommand.setDescription("Get Overall (EXP) ranking");
    subcommand.addNumberOption((option) => {
        option.setName("max_fields");
        option.setDescription("Maximum number of fields.");
        option.setMinValue(1);
        option.setMaxValue(50);
        option.setRequired(false);

        return option;
    });

    return subcommand;
});
ranking_command.addSubcommand((subcommand) => {
    subcommand.setName("adventurer");
	subcommand.setDescription("Get Adventurer ranking");
    subcommand.addNumberOption((option) => {
        option.setName("max_fields");
        option.setDescription("Maximum number of fields.");
        option.setMinValue(1);
        option.setMaxValue(50);
        option.setRequired(false);

        return option;
    });

    return subcommand;
});
ranking_command.addSubcommand((subcommand) => {
    subcommand.setName("relichunter");
	subcommand.setDescription("Get Relic Hunter ranking");
    subcommand.addNumberOption((option) => {
        option.setName("max_fields");
        option.setDescription("Maximum number of fields.");
        option.setMinValue(1);
        option.setMaxValue(50);
        option.setRequired(false);

        return option;
    });

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
    subcommand.addNumberOption((option) => {
        option.setName("max_fields");
        option.setDescription("Maximum number of fields.");
        option.setMinValue(1);
        option.setMaxValue(50);
        option.setRequired(false);

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
            await get_weekly(interaction, client);
            break;
        case "monthly":
            await get_monthly(interaction, client);
            break;
        case "overall":
            await get_overall(interaction, client);
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

    const max_fields = interaction.options.get("max_fields")?.value || 20;

    try{
        const response = await fetch("https://gobattle.io/api.php/valdoranking?platform=Discord&ud=");

        if (!response.ok){
            await interaction.editReply(`Impossible to recover the ranking. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const data = await response.json();

        const embed = new EmbedBuilder();

        embed.setTitle("👑 King Ranking 👑");

        const description = "You can earn reputation points by killing enemies, bosses, completing dungeons, and killing other players in the arena.\nThe new king of Valdoran will be chosen every Sunday at midnight (UTC Time) and will earn 150 diamonds, ascend the throne, wear the crown and can use the `/coin` command.";
        embed.setDescription(description, {split: false});
        
	    embed.addFields(
            {name: "> 🗓 __Week__", value: `> ${data?.week || "_Unknown?_"}`, inline: true},
            {name: "> 🗓 __Year__", value: `> ${data?.year || "_Unknown?_"}`, inline: true}
        );
        
        const table_data = [["IDX", "NICK", "REP", "ID"]];
        const ranking = data?.ranking;
        for (let i = 0; i < max_fields && i < ranking.length; i++){
            const field = ranking[i];
            table_data.push(["#" + (i + 1), restrict_text(field?.nick, 20), format_score(field?.reputation), field?.id]);
        }

        const attachment = new AttachmentBuilder(table(table_data));
        attachment.name = "table.png";

        embed.setImage(`attachment://${attachment.name}`);
        embed.setTimestamp();

        await interaction.editReply({
            embeds: [embed], 
            files: [attachment]
        });
    }catch(error){
        await interaction.editReply(`Failed to generate King ranking...\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_weekly(interaction, client){
    await interaction.deferReply();

    const max_fields = interaction.options.get("max_fields")?.value || 20;

    try{
        const response = await fetch("https://gobattle.io/api.php/stats/weekly?platform=Discord&ud=");

        if (!response.ok){
            await interaction.editReply(`Impossible to recover the ranking. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const data = await response.json();

        const embed = new EmbedBuilder();

        embed.setTitle("🔥 Weekly Ranking 🔥");

        const table_data = [["IDX", "NICK", "COINS", "KILLS", "DEATHS", "EXP", "LVL"]];
                    
        for (let i = 0; i < max_fields && i < data.length; i++){
            const field = data[i];
            const exp = parseInt(field?.experience, 10);
            const level = get_level(exp);
            table_data.push(["#" + (i + 1), restrict_text(field?.nick, 20), format_score(field?.coins), format_score(field?.kills), format_score(field?.deaths), format_score(field?.experience), level.toString()]);
        }

        const attachment = new AttachmentBuilder(table(table_data));
        attachment.name = "table.png";

        embed.setImage(`attachment://${attachment.name}`);
        embed.setTimestamp();

        await interaction.editReply({
            embeds: [embed], 
            files: [attachment]
        });
    }catch(error){
        await interaction.editReply(`Failed to generate Weekly ranking...\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_monthly(interaction, client){
    await interaction.deferReply();

    const max_fields = interaction.options.get("max_fields")?.value || 20;

    try{
        const response = await fetch("https://gobattle.io/api.php/stats/monthly?platform=Discord&ud=");

        if (!response.ok){
            await interaction.editReply(`Impossible to recover the ranking. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const data = await response.json();

        const embed = new EmbedBuilder();

        embed.setTitle("🔥 Monthly Ranking 🔥");

        const table_data = [["IDX", "NICK", "COINS", "KILLS", "DEATHS", "EXP", "LVL"]];
                    
        for (let i = 0; i < max_fields && i < data.length; i++){
            const field = data[i];
            const exp = parseInt(field?.experience, 10);
            const level = get_level(exp);
            table_data.push(["#" + (i + 1), restrict_text(field?.nick, 20), format_score(field?.coins), format_score(field?.kills), format_score(field?.deaths), format_score(field?.experience), level.toString()]);
        }

        const attachment = new AttachmentBuilder(table(table_data));
        attachment.name = "table.png";

        embed.setImage(`attachment://${attachment.name}`);
        embed.setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            files: [attachment]
        });
    }catch(error){
        await interaction.editReply(`Failed to generate Monthly ranking...\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_overall(interaction, client){
    await interaction.deferReply();

    const max_fields = interaction.options.get("max_fields")?.value || 20;

    try{
        const response = await fetch("https://gobattle.io/api.php/stats/overall?platform=Discord&ud=");

        if (!response.ok){
            await interaction.editReply(`Impossible to recover the ranking. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const data = await response.json();

        const embed = new EmbedBuilder();

        embed.setTitle("🔥 Overall Ranking (EXP) 🔥");

        const table_data = [["IDX", "NICK", "COINS", "KILLS", "DEATHS", "EXP", "LVL"]];
        
        for (let i = 0; i < max_fields && i < data.length; i++){
            const field = data[i];
            const exp = parseInt(field?.experience, 10);
            const level = get_level(exp);
            table_data.push(["#" + (i + 1), restrict_text(field?.nick, 20), format_score(field?.coins), format_score(field?.kills), format_score(field?.deaths), format_score(field?.experience), level.toString()]);
        }

        const attachment = new AttachmentBuilder(table(table_data));
        attachment.name = "table.png";

        embed.setImage(`attachment://${attachment.name}`);
        embed.setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            files: [attachment]
        });
    }catch(error){
        await interaction.editReply(`Failed to generate Overall ranking...\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_adventurer(interaction, client){
    await interaction.deferReply();

    const max_fields = interaction.options.get("max_fields")?.value || 20;

    try{
        const response = await fetch("https://gobattle.io/api.php/v1/stats/ranking/adventurer?platform=Discord&ud=");

        if (!response.ok){
            await interaction.editReply(`Impossible to recover the ranking. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const data = await response.json();

        const embed = new EmbedBuilder();

        embed.setTitle("🤠 Adventurer Ranking 🤠");

        const table_data = [["RANK", "NICK", "LVL", "SCORE", "ID"]];
                    
        for (let i = 0; i < max_fields && i < data.length; i++){
            const field = data[i];
            table_data.push(["#" + field?.rank, restrict_text(field?.nick, 20), get_level_adventurer(field?.score).toString(), format_score(field?.score), field?.id.toString()]);
        }

        const attachment = new AttachmentBuilder(table(table_data));
        attachment.name = "table.png";

        embed.setImage(`attachment://${attachment.name}`);
        embed.setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            files: [attachment]
        });
    }catch(error){
        await interaction.editReply(`Failed to generate Adventurer ranking...\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_relic_hunter(interaction, client){
    await interaction.deferReply();

    const max_fields = interaction.options.get("max_fields")?.value || 20;

    try{
        const response = await fetch("https://gobattle.io/api.php/v1/stats/ranking/relichunter?platform=Discord&ud=");

        if (!response.ok){
            await interaction.editReply(`Impossible to recover the ranking. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const data = await response.json();

        const embed = new EmbedBuilder();

        embed.setTitle("🏺 Relic Hunter Ranking 🏺");

        const table_data = [["RANK", "NICK", "LVL", "SCORE", "ID"]];
                    
        for (let i = 0; i < max_fields && i < data.length; i++){
            const field = data[i];
            table_data.push(["#" + field?.rank, restrict_text(field?.nick, 20), get_level_adventurer(field?.score).toString(), format_score(field?.score), field?.id.toString()]);
        }

        const attachment = new AttachmentBuilder(table(table_data));
        attachment.name = "table.png";

        embed.setImage(`attachment://${attachment.name}`);
        embed.setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            files: [attachment]
        });
    }catch(error){
        await interaction.editReply(`Failed to generate Hunter Ranking ranking...\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_speedrun(interaction, client){
    await interaction.deferReply();

    const dungeon_id = interaction.options.get("dungeon_id")?.value;
    const max_fields = interaction.options.get("max_fields")?.value || 20;

    try{
        const response = await fetch(`https://gobattle.io/api.php/v1/stats/speedrun/${dungeon_id}`);

        if (!response.ok){
            await interaction.editReply(`Map _#${dungeon_id}_ not found, try another dungeon ID.\nNormally the dungeon ID is listed in chat when you complete your speedrun.\nIf you don't see anything, you haven't used the \`/speedrun\` command correctly on GoBattle.io.`);
            return;
        }

        const data = await response.json();

        const embed = new EmbedBuilder();

        embed.setTitle("🏁 Speedrun Ranking 🏁");
        embed.setDescription("Do you also want to be included in the leaderboard?\nUse the \`/speedrun\` command on GoBattle.io to start a speedrun session and try to do better than the others!");
        embed.addFields(
            {name: "> 🏰 __Dungeon name__", value: `> **${data.name || "_Unknown?_"}**`, inline: true},
            {name: "> 🏷️ __Dungeon ID__", value: `> ${dungeon_id}`, inline: true}
        );

        const table_data = [["RANK", "NICK", "TIME", "ID"]];
        const ranking = data.ranking;
        const list_size = ranking.length;
        for (var i = 0; i < max_fields && i < list_size; i++){
            const field = ranking[i];
            table_data.push([field?.rank.toString(), restrict_text(field?.nick, 20), format_speed_run_time(field?.time), field?.id.toString()]);
        }

        const attachment = new AttachmentBuilder(table(table_data));
        attachment.name = "table.png";

        embed.setImage(`attachment://${attachment.name}`);
        embed.setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            files: [attachment]
        });
    }catch(error){
        await interaction.editReply(`Failed to generate Speedrun ranking...\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

exports.get_ranking = get_ranking;
exports.ranking_command = ranking_command;
