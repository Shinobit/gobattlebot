const {SlashCommandBuilder} = require("discord.js");

const install_link_command = new SlashCommandBuilder();
install_link_command.setName("install_link");
install_link_command.setDescription("Get the installation link of this application.");

async function get_install_link(interaction, client){
    const install_url = client.application.customInstallURL || `https://discord.com/api/oauth2/authorize?client_id=${client.application.id}&permissions=18685255743552&scope=bot+applications.commands`;
    await interaction.reply(`# Install me to get utility features related to the MMORPG GoBattle.io ❤️: [Click here to install](${install_url}).`);
}

exports.get_install_link = get_install_link;
exports.install_link_command = install_link_command;
