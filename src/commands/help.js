const {SlashCommandBuilder, EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType} = require("discord.js");
const {send_embed_layout} = require("../utils.js");

const help_command = new SlashCommandBuilder();
help_command.setName("help");
help_command.setDescription("Get help on how to use me.");

async function get_list_commands(application, command_type = ApplicationCommandType.ChatInput){
	const result = new Map();
	const commands = await application.commands.fetch();

	for (const command of commands.values()){
		let base = true;
		
		if (command.type != command_type){
			continue;
		}

		for (const option of command.options){
			if (option.type == ApplicationCommandOptionType.Subcommand){
				base = false;
				if (option.type == command_type){
					result.set(`${command.name} ${option.name}`, {id: command.id, description: option.description, base: command});
				}
			}else if (option.type == ApplicationCommandOptionType.SubcommandGroup){
				base = false;
				for (const sub_option of option.options){
					if (sub_option.type == command_type){
						result.set(`${command.name} ${option.name} ${sub_option.name}`, {id: command.id, description: sub_option.description, base: command});
					}
				}
			}
		}

		if (base){
			result.set(command.name, {id: command.id, description: command.description, base: command});
		}
	}

	return result;
}

async function get_help(interaction, client){
    await interaction.deferReply();

	try{
		const embed = new EmbedBuilder();
        embed.setTitle("ℹ️ List of commands ℹ️");

		const commands = await get_list_commands(client.application);

		const header_description = `Hi ${interaction.user}, Here are some commands that might be useful to you:`;
        const max_items_by_pages = 7;
        const pages = new Array(Math.ceil(commands.size / max_items_by_pages));

		let current_page = -1;
		let i = 0;
        for (const [name, data] of commands.entries()){
            if (Math.floor(i / max_items_by_pages) != current_page){
                current_page++;
                pages[current_page] = "";
            }

            pages[current_page] += `* </${name}:${data.id}>: **${data.description}**\n`;
			
			i++;
		}

		embed.setTimestamp();

        await send_embed_layout(interaction, embed, pages, header_description);
	}catch (error){
		await interaction.editReply(`Unable to list commands.\nContact ${client.application.owner} to resolve this issue.`);
		console.error(error);
	}
}

exports.get_help = get_help;
exports.help_command = help_command;
