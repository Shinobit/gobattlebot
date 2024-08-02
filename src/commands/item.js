const {SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType} = require("discord.js");
const {ultra_list} = require("../ultralist.json");
const {restrict_text, sum, format_score, format_score_with_commas, application_emoji_cache} = require("../utils.js");

const items_map = new Map();
for (const item_data of ultra_list){
    if (typeof item_data.id == "number"){
        items_map.set(item_data.id, item_data);
    }
}

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

        const item_info = items_map.get(item_id);

        if (!item_info){
            await interaction.editReply("Sorry, the specified item does not exist or has not yet been indexed by the Gobattle API.");
            return;
        }

        const unknown_item_emoji = application_emoji_cache.get("item_91") || "📦";
        const item_emoji = application_emoji_cache.get(item_info?.emoji) || unknown_item_emoji;

        const embed = new EmbedBuilder();
        embed.setTitle(`${item_emoji} ${restrict_text(item_info.name, 60)}`);
        if (typeof item_emoji != "string"){
            embed.setThumbnail(item_emoji.imageURL());
        }
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

        const chest_emoji = application_emoji_cache.get("item_760") || "🧰";
        const total_ultrarare_formatted = format_score_with_commas(total_ultrarare);
        const header_description = `Results are calculated based on **${format_score_with_commas(total)}** samples (*chest opened by players ${chest_emoji}*) including **${total_ultrarare_formatted}** ultrarare drops.\n`;
        const max_items_by_pages = 7;
        const pages = new Array(Math.ceil(values.length / max_items_by_pages));
        const unknown_item_emoji = application_emoji_cache.get("item_91") || "📦";

        const drops_entries = Object.entries(drops);

        let current_page = -1;
        for (let i = 0; i < values.length; i++){
            if (Math.floor(i / max_items_by_pages) != current_page){
                current_page++;
                pages[current_page] = header_description;
            }

            const [key, value] = drops_entries[i];
            const ultra_info = items_map.get(parseInt(key, 10));
            const item_emoji = application_emoji_cache.get(ultra_info?.emoji) || unknown_item_emoji;
            pages[current_page] += `* ${item_emoji} **${restrict_text(ultra_info?.name || "*Unknow?*", 45)}**#${key}: \`${format_score(value)} (${(value / total_ultrarare * 100).toPrecision(2)}%)\`\n`;
        }

        current_page = 1;
        embed.setDescription(pages[current_page - 1] || "***There are no items to display in this list at the moment...***");

        embed.addFields(
            {name: "> 🌟 __Ultrarare__", value: `> ${total_ultrarare_formatted} (${(drops_ratio * 100).toPrecision(2)}%)`, inline: true},
            {name: `> ${unknown_item_emoji} __Other__`, value: `> ${format_score_with_commas(total - total_ultrarare)} (${((1 - drops_ratio) * 100).toPrecision(2)}%)`, inline: true}
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
            content: "Special mention to _Sage of the Ivy_ for providing some metadata on most of the game's ultrarares while waiting for the GoBattle API update!\nThanks to him!",
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
        await interaction.editReply(`Unable to generate template.\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_list(interaction, client){
    await interaction.reply("Sorry this command is under development and cannot be used at the moment.");
}

exports.get_item = get_item;
exports.item_command = item_command;
