const {SlashCommandBuilder, EmbedBuilder, AttachmentBuilder} = require("discord.js");
const {ultra_list} = require("../ultralist.json");
const {restrict_text, sum, format_score} = require("../utils.js");

const item_command = new SlashCommandBuilder();
item_command.setName("item");
item_command.setDescription("Command relating to items and other consumables in the game.");
item_command.addSubcommand((subcommand) => {
    subcommand.setName("info");
	subcommand.setDescription("Obtain the characteristics of an item.");
    subcommand.addNumberOption((option) => {
        option.setName("item_id");
        option.setDescription("The identifier of the item.");
        option.setMinValue(1);
        option.setRequired(true);

        return option;
    });

    return subcommand;
});
item_command.addSubcommand((subcommand) => {
    subcommand.setName("list");
	subcommand.setDescription("Get the list of all items in the game with their respective ID.");

    return subcommand;
});
item_command.addSubcommand((subcommand) => {
    subcommand.setName("ultrarare_drops");
	subcommand.setDescription("Get statistics on the overall frequency of Ultra Rares spawning in chests.");

    return subcommand;
});

async function get_item(interaction, client){
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand){
        case "info":
            await get_info(interaction, client);
            break;
        case "ultrarare_drops":
            await get_ultrarare_drops(interaction, client);
            break;
        case "list":
            await get_list(interaction, client);
            break;
        default:
            await interaction.reply(`Invalid subcommand.\nContact ${client.application.owner} to resolve this issue.`);
    }
}

async function get_info(interaction, client){
    await interaction.deferReply();

    try{
        const item_id = interaction.options.get("item_id")?.value;

        let item_info;
        for (const ultra of ultra_list){
            if (item_id == ultra.id){
                item_info = ultra;
                break;
            }
        }

        if (!item_info){
            await interaction.editReply("Sorry, the specified item does not exist or has not yet been indexed by the Gobattle API.");
            return;
        }

        const attachment = new AttachmentBuilder(__dirname + "/../images/unknown_item.png");
        attachment.name = "item_icon.png";

        const embed = new EmbedBuilder()
        embed.setTitle(restrict_text(item_info.name, 60));
        embed.setThumbnail(`attachment://${attachment.name}`);
        embed.setDescription(item_info.description ? restrict_text(item_info.description, 250) : "_Description Unknown_");
        embed.setColor(0x500000);
        embed.addFields(
            {name: "> 🏷️ __ID__", value: `> ${item_id}`, inline: true},
            {name: "> 🌟 __Rarity__", value: `> ***${"Ultrarare"}***`, inline: true},
            {name: "> 🛠️ __Max uses__", value: `> ${item_info.uses || "_Unknown_"}`, inline: true}
        );

        embed.addFields(
            {name: "> 🛍️ __Max in inventory__", value: `> ${item_info.max_in_inventory || "_Unknown_"}`, inline: true},
            {name: "> 📥 __Drops in__", value: `> ${item_info.drops ? restrict_text(item_info.drops, 50) : "_Unknown_"}`, inline: true},
            {name: "> 🤝 __Tradable__", value: `> ${"_Unknown_"}`, inline: true}
        );
        
        embed.addFields(
            {name: "> 🏺 __Is relic__", value: `> ${item_info.is_relic ? (item_info.is_relic ? "Yes": "No") : "_Unknown_"}`, inline: true},
            {name: "> 💰 __Price__", value: `> ${"_Unknown_"}`, inline: true}
        );

        embed.setTimestamp();
        embed.setFooter({text: "Source: Sage of the Ivy"});

        await interaction.editReply({
            files: [attachment],
            embeds: [embed],
            content: "This feature is under development, information may not be accurate."
        });
    }catch(error){
        await interaction.editReply(`Unable to retrieve information on this item.\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_ultrarare_drops(interaction, client){
    await interaction.deferReply();

    try{
        const response = await fetch("https://gobattle.io/api.php/v1/stats/ultrarare/drops");

        if (!response.ok){
            await interaction.editReply("Unable to obtain general information on the general frequency of obtaining ultrarares in Gobattle. There is a problem with the Gobattle API.");
            return;
        }

        const data_json = await response.json();

        const total = data_json.total;
        const drops = data_json.drops;
        const values = Object.values(drops);

        const total_ultrarare = sum(values);

        const drops_ratio = total_ultrarare / (total || 1);

        const embed = new EmbedBuilder();
        embed.setTitle("Current average chance of getting an Ultrarare from a chest.");

        let description = `Results are calculated based on ${total} samples (chest opened by players) including ${total_ultrarare} ultrarare drops.\n`;
        const drops_entries = Object.entries(drops);
        for (const [key, value] of drops_entries){
            let name_ultra;
            for (const ultra_data of ultra_list){
                if (ultra_data.id && ultra_data.id == key){
                    name_ultra = ultra_data.name;
                    break;
                }
            }

            description += `* ${restrict_text(name_ultra || "*Unknow?*", 45)}#${key}: \`${format_score(value)} (${(value / total_ultrarare * 100).toPrecision(2)}%)\`\n`;
        }

        embed.setDescription(description, {split: false});

        embed.addFields(
            {name: "> 🌟 __Ultrarare__", value: `> ${(drops_ratio * 100).toPrecision(2)}%`, inline: true},
            {name: "> 📦 __Other__", value: `> ${((1 - drops_ratio) * 100).toPrecision(2)}%`, inline: true}
        );

        embed.setTimestamp();

        await interaction.editReply({
            content: "Special mention to _Sage of the Ivy_ for providing some metadata on most of the game's ultrarares while waiting for the GoBattle API update!\nThanks to him!",
            embeds: [embed]
        });
    }catch(error){
        await interaction.editReply(`Unable to generate template.\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_list(interaction, client){
    await interaction.reply("Sorry this command is under development and cannot be used at the moment.");
}

exports.get_item = get_item;
exports.item_command = item_command;
