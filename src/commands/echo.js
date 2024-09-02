const {SlashCommandBuilder, PermissionFlagsBits} = require("discord.js");
const {send_echo, get_first_chat_channel} = require("../utils.js");

const echo_command = new SlashCommandBuilder();
echo_command.setName("echo");
echo_command.setDescription("Ask me to send a message in the current guild or in all the guils where I am present.");
echo_command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
echo_command.addStringOption((option) => {
    option.setName("message");
    option.setDescription("The message to send. Any abuse will be punished.");
    option.setRequired(true);
    option.setMinLength(1);
    option.setMaxLength(1900);

    return option;
});
echo_command.addBooleanOption((option) => {
    option.setName("all_guilds");
    option.setDescription("The message will be sent to all guilds I have joined.");
    option.setRequired(false);

    return option;
});

async function get_echo(interaction, client){
    await interaction.deferReply({ephemeral: true});
    
    const message = interaction.options.get("message")?.value;
    const all_guilds = interaction.options.get("all_guilds")?.value;

    try{
        if (all_guilds){
            await send_echo(client, message);
        }else{
            try{
                await interaction.channel.send(message);
            }catch{
                const channel = await get_first_chat_channel(interaction.guild, client);
                await channel.send(message);
            }
        }

        await interaction.editReply("The message has been sent.");
    }catch(error){
        await interaction.editReply("The message could not be sent.");
    }
}

exports.get_echo = get_echo;
exports.echo_command = echo_command;
