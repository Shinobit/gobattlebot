const {SlashCommandBuilder, PermissionFlagsBits} = require("discord.js");

const leave_command = new SlashCommandBuilder();
leave_command.setName("leave");
leave_command.setDescription("Kick me out of the current guild.");
leave_command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

async function get_leave(interaction, client){
    const install_url = client.application.customInstallURL || `https://discord.com/api/oauth2/authorize?client_id=${client.application.id}&permissions=18685255743552&scope=bot+applications.commands`;
    await interaction.reply(`Are you asking me to leave? 🥺\nToo bad, maybe I wasn't up to my duties. If you have feedback to give to my developers, especially ${client.application.owner}, I may improve to better meet your needs.\nIf you change your mind, you can reinstall me with [this link](${install_url}).\nMaybe see you next time and thanks for trying me!`);
    await interaction.guild.leave();
}

exports.get_leave = get_leave;
exports.leave_command = leave_command;
