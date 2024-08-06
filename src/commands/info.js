const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {get_info_application, format_score_with_commas} = require("./../utils.js");

const info_command = new SlashCommandBuilder();
info_command.setName("info");
info_command.setDescription("Get metadata about the GoBattle.io Bot.");

async function get_info(interaction, client){
    await interaction.deferReply();

    try{
        const embed = new EmbedBuilder();
        embed.setTitle(client.application.name);
        embed.setURL(client.application.customInstallURL || `https://discord.com/api/oauth2/authorize?client_id=${client.application.id}&permissions=18685255743552&scope=bot+applications.commands`);
        embed.setDescription(client.application.description);
        embed.setThumbnail(client.user.avatarURL());

        const info = await get_info_application(client.application);
        const approximate_guild_count = info?.approximate_guild_count || "_Unknown?_";
        const tos = info?.terms_of_service_url || "https://gobattle.io/tos.html";
        const pp = info?.privacy_policy_url || "https://www.iubenda.com/privacy-policy/8108614";
        const project_initiator_user_id = "461495109855215616"; // Please be courteous and do not change this value.

        embed.addFields(
            {name: "> Official Gobattle.io Guild", value: "> [Link](https://discord.gg/gobattle-io-official-380588354934276097)", inline: true},
            {name: "> Application Owner", value: `> ${client.application.owner}`, inline: true},
            {name: "> Approximate Guild count", value: `> ${typeof approximate_guild_count == "number" ? format_score_with_commas(approximate_guild_count) : approximate_guild_count}`, inline: true}
        );

        embed.addFields(
            {name: "> Terms of Service", value: `> [Link](${tos})`, inline: true},
            {name: "> Privacy Policy", value: `> [Link](${pp})`, inline: true},
            {name: "> Project initiator", value: `> <@${project_initiator_user_id}>`, inline: true}
        );

        await interaction.editReply({
            embeds: [embed]
        });
    }catch(error){
        console.error(error);
    }
}

exports.get_info = get_info;
exports.info_command = info_command;
