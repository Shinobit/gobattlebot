const {SlashCommandBuilder, EmbedBuilder, AttachmentBuilder} = require("discord.js");
const {table} = require("../utils.js");
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

async function get_info(interaction, client){
    await interaction.reply("This subcommand is in development and cannot be used at this time.");
}

async function get_list(interaction, client){
    await interaction.deferReply();

    const embed = new EmbedBuilder();
    embed.setTitle("🏰 Dungeon List 🏰");
    const description = "Note that this list is not updated in real time like other lists. This is a pre-list awaiting the GoBattle.io API update.";

    embed.addFields(
        {name: "> 🔢 __Number of dungeons__", value: `> ${dungeon_list.length}`, inline: true},
    );

    embed.setDescription(description, {split: false});

    const table_data = [["ID", "NAME", "LVL MIN"]];

    for (const dungeon_data of dungeon_list){
        table_data.push(["#" + dungeon_data.id, dungeon_data.name || "Unknow?", dungeon_data.min_level || "Unknow?"]);
    }

    const attachment = new AttachmentBuilder(table(table_data));
    attachment.name = "table.png";

    embed.setImage(`attachment://${attachment.name}`);
    embed.setTimestamp();

    await interaction.editReply({
        embeds: [embed], 
        files: [attachment]
    });
}

exports.get_dungeon = get_dungeon;
exports.dungeon_command = dungeon_command;
