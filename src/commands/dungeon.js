const {SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType} = require("discord.js");
const {restrict_text} = require("../utils.js");
const {dungeon_list} = require("../dungeon_list.json");

const dungeon_command = new SlashCommandBuilder();
dungeon_command.setName("dungeon");
dungeon_command.setDescription("Command relating to dungeons and other maps in the game.");
dungeon_command.addSubcommand((subcommand) => {
    subcommand.setName("info");
	subcommand.setDescription("Obtain the characteristics of a dungeon.");
    subcommand.addNumberOption((option) => {
        option.setName("dungeon_id");
        option.setDescription("The dungeon identifier.");
        option.setMinValue(1);
        option.setRequired(true);

        return option;
    });

    return subcommand;
});
dungeon_command.addSubcommand((subcommand) => {
    subcommand.setName("list");
	subcommand.setDescription("Get the list of all dungeons in the game with their respective ID.");

    return subcommand;
});

async function get_dungeon(interaction, client){
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand){
        case "info":
            await get_info(interaction, client);
            break;
        case "list":
            await get_list(interaction, client);
            break;
        default:
            await interaction.reply(`Invalid subcommand.\nContact ${client.application.owner} to resolve this issue.`);
    }
}

async function get_info(interaction, _client){
    await interaction.reply("This subcommand is in development and cannot be used at this time.");
}

async function get_list(interaction, _client){
    await interaction.deferReply();

    const embed = new EmbedBuilder();
    embed.setTitle("🏰 Dungeon List 🏰");

    const header_description = "Note that this list is not updated in real time like other lists. This is a pre-list awaiting the GoBattle.io API update.\n";
    const max_items_by_pages = 7;
    const pages = new Array(Math.ceil(dungeon_list.length / max_items_by_pages));

    let current_page = -1;
    for (let i = 0; i < dungeon_list.length; i++){
        if (Math.floor(i / max_items_by_pages) != current_page){
            current_page++;
            pages[current_page] = header_description;
        }

        const dungeon_data = dungeon_list[i];
        pages[current_page] += `* **${restrict_text(dungeon_data.name || "*Unknow?*", 45)}**#${dungeon_data.id}: \`${dungeon_data.min_level || "Unknow?"}💪\`\n`;
    }

    current_page = 1;
    embed.setDescription(pages[current_page - 1] || "***There are no items to display in this list at the moment...***");

    embed.addFields(
        {name: "> 🔢 __Number of dungeons__", value: `> ${dungeon_list.length}`, inline: true},
        {name: "> __Min level__", value: "> 💪", inline: true}
    );

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
}

exports.get_dungeon = get_dungeon;
exports.dungeon_command = dungeon_command;
