const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");

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
        embed.addFields(
            {name: "Gobattle.io server", value: "[Link](https://discord.gg/gobattle-io-official-380588354934276097)", inline: false},
            {name: "BOT Developer server", value: "[Link](https://discord.gg/jhGdY5ArBU)", inline: false},
            {name: "BOT Owner", value: `${client.application.owner}`, inline: false}
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
