const {SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType} = require("discord.js");
const zlib = require("zlib");
const {restrict_text} = require("../utils.js");

const asset_command = new SlashCommandBuilder();
asset_command.setName("asset");
asset_command.setDescription("Command relating to game data files (client side).");
asset_command.addSubcommand((subcommand) => {
    subcommand.setName("info");
	subcommand.setDescription("Get a specific client file.");
    subcommand.addIntegerOption((option) => {
        option.setName("file_id");
        option.setDescription("The identifier of the item.");
        option.setMinValue(1);
        option.setRequired(true);

        return option;
    });

    return subcommand;
});
asset_command.addSubcommand((subcommand) => {
    subcommand.setName("list");
	subcommand.setDescription("Get the list of files with their respective ID.");

    return subcommand;
});

async function get_asset(interaction, client){
    const subcommand = interaction.options.getSubcommand();
    if (subcommand == "list"){
        await get_list(interaction, client);
    }else if (subcommand == "info"){
        await get_info(interaction, client);
    }else{
        await interaction.reply(`Invalid subcommand.\nContact ${client.application.owner} to resolve this issue.`);
    }
}

async function get_list(interaction, client){
    await interaction.deferReply();

    try{
        const platform = "iOS";
        const version = 115;

        const response = await fetch(`https://gobattle.io/api.php/bootstrap/${version}?platform=${platform}&ud=`);

        if (!response.ok){
            await interaction.editReply(`Unable to recover information from game files.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const data = await response.json();

        const embed = new EmbedBuilder();
        embed.setTitle("🗂️ List of assets 🗂️");

        const header_description = "List of assets with their respective identifiers:\n";
        const max_items_by_pages = 10;
        const pages = new Array(Math.ceil(data.files.length / max_items_by_pages));

        let current_page = -1;
        for (let i = 0; i < data.files.length; i++){
            if (Math.floor(i / max_items_by_pages) != current_page){
                current_page++;
                pages[current_page] = header_description;
            }

            const file = data.files[i];
            const is_compressed = file.file.endsWith("$");
            const file_name = is_compressed ? file.file.slice(0, -1) : file.file;

            if (is_compressed){
                pages[current_page] += `* **${file_name}**#${i + 1}\n`;
            }else{
                const url = new URL(`${data.filesBaseURL}/${file_name}`);
                pages[current_page] += `* **[${file_name}](${url})**#${i + 1}\n`;
            }
        }

        current_page = 1;
        embed.setDescription(pages[current_page - 1] || "***There are no items to display in this list at the moment...***");

        const nb_pages = pages.length || 1;

        embed.setFooter({text: `Page ${current_page}/${nb_pages}`});
        embed.setTimestamp();

        const previous_button = new ButtonBuilder();
        previous_button.setCustomId("previous");
        previous_button.setEmoji("◀️");
        previous_button.setStyle(ButtonStyle.Primary);
        previous_button.setDisabled(current_page == 1);

        const next_button = new ButtonBuilder();
        next_button.setCustomId("next");
        next_button.setEmoji("▶️");
        next_button.setStyle(ButtonStyle.Primary);
        next_button.setDisabled(current_page == nb_pages);

        const row = new ActionRowBuilder();
        row.addComponents(previous_button, next_button);

        const response_interaction = await interaction.editReply({
            embeds: [embed],
            components: [row]
        });

        function collector_filter(m){
            const result = m.user.id == interaction.user.id;

            if (!result){
                m.reply({content: "You cannot interact with a command that you did not initiate yourself.", ephemeral: true}).catch((error) => {
                    console.error(error);
                });
            }

            return result;
        }

        async function button_interaction_logic(response_interaction){
            try{
                const confirmation = await response_interaction.awaitMessageComponent({filter: collector_filter, componentType: ComponentType.Button, time: 60_000});

                if (confirmation.customId === "previous"){
                    current_page--;
                } else if (confirmation.customId === "next"){
                    current_page++;
                }

                embed.setDescription(pages[current_page - 1]);
                embed.setFooter({text: `Page ${current_page}/${nb_pages}`});
                previous_button.setDisabled(current_page == 1);
                next_button.setDisabled(current_page == nb_pages);

                response_interaction = await confirmation.update({embeds: [embed], components: [row]});
                await button_interaction_logic(response_interaction);
            }catch (_error){
                await interaction.editReply({content: "-# ⓘ This interaction has expired, please use the command again to be able to navigate the list.", components: []});
            }
        }

        await button_interaction_logic(response_interaction);
    }catch(error){
        await interaction.editReply(`Unable to retrieve file list. \nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_info(interaction, client){
    await interaction.deferReply();

    try{
        const platform = "iOS";
        const version = 115;

        const response = await fetch(`https://gobattle.io/api.php/bootstrap/${version}?platform=${platform}&ud=`);

        if (!response.ok){
            await interaction.editReply(`Unable to recover information from game files.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const data = await response.json();

        const file_id = interaction.options.get("file_id")?.value;
        const nb_files = data.files.length;
        if (file_id < 1 || file_id > nb_files){
            await interaction.editReply(`Invalid file ID, try another identifier between 1 and ${nb_files} inclusive.`);
            return;
        }

        const file_data = data.files[file_id - 1];
        
        const url = new URL(`${data.filesBaseURL}/${file_data.file}`);
        const response_secondary = await fetch(url);

        if (!response_secondary.ok){
            await interaction.editReply(`Unable to recover information from game files.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const array_buffer = await response_secondary.arrayBuffer();
        const file_buffer = Buffer.from(array_buffer);
        const is_compressed = file_data.file.endsWith("$");

        const attachment = new AttachmentBuilder(is_compressed ? zlib.inflateSync(file_buffer) : file_buffer);
        attachment.name = is_compressed ? file_data.file.slice(0, -1) : file_data.file;

        const embed = new EmbedBuilder();
        embed.setTitle(restrict_text(`GoBattle.io Asset __\"${attachment.name}\"__.`, 60));
        embed.setColor(0x500000);
        
        embed.addFields(
            {name: "> 🏷️ __ID__", value: `> ${file_id}`, inline: true},
            {name: "> 🔗 __Source__", value: `> [Click here](${url.href})`, inline: true},
            {name: "> 🗜️ __Compressed__", value: `> ${is_compressed ? "zlib": "_No_"}`, inline: true}
        );

        embed.setFooter({text: "© SHINOBIT LLC"});
        embed.setTimestamp();

        await interaction.editReply({
            embeds: [embed],
            files: [attachment]
        });
    }catch(error){
        await interaction.editReply(`Unable to recover file.\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

exports.get_asset = get_asset;
exports.asset_command = asset_command;
