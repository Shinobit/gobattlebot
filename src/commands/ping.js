const {SlashCommandBuilder} = require("discord.js");

const ping_command = new SlashCommandBuilder();
ping_command.setName("ping");
ping_command.setDescription("Check if the bot is operational.");

async function get_ping(interaction, client){
    try{
        await interaction.reply({content: "Pong!", ephemeral: true});
    }catch(error){
        console.error(error);
    }
}

exports.get_ping = get_ping;
exports.ping_command = ping_command;
