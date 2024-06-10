const {SlashCommandBuilder} = require("discord.js");

const help_command = new SlashCommandBuilder();
help_command.setName("help");
help_command.setDescription("Get help on how to use me.");

async function get_help(interaction, client){
    await interaction.deferReply({ephemeral: true});

	try{
		const commands = await client.application.commands.fetch();
		
		let description = "";
	
		for (const command of commands.values()){
		    description += `\n- </${command.name}:${command.id}>`;

            for (const option of command.options){
                description += ` _<${option.name}${option.required ? "*" : "?"}>_`;
            }

            description += `: **${command.description}**`;
		}

		interaction.editReply(`Hi ${interaction.user}, Here are some commands that might be useful to you: ${description}`);
	}catch (error){
		await interaction.editReply(`Unable to list commands.\nContact ${client.application.owner} to resolve this issue.`);
		console.error(error);
	}
}

exports.get_help = get_help;
exports.help_command = help_command;
