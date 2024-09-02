const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {restrict_text, send_embed_layout, is_my_developer, application_emoji_cache} = require("../utils.js");
const {dungeon_list} = require("../dungeon_list.json");
const {ultra_list} = require("../ultralist.json");

const items_map = new Map();
for (const item_data of ultra_list){
    if (typeof item_data.id == "number"){
        items_map.set(item_data.id, item_data);
    }
}

const dungeon_command = new SlashCommandBuilder();
dungeon_command.setName("dungeon");
dungeon_command.setDescription("Command relating to dungeons and other maps in the game.");
dungeon_command.addSubcommand((subcommand) => {
    subcommand.setName("info");
	subcommand.setDescription("Obtain the characteristics of a dungeon.");
    subcommand.addIntegerOption((option) => {
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
    if (!is_my_developer(client, interaction.user)){
        await interaction.reply("This subcommand is in development and cannot be used at this time.");
        return;
    }

    await interaction.deferReply();

    try{
        const response = await fetch("https://gobattle.io/api.php/v1/stats/ultrarare/drops");

        if (!response.ok){
            await interaction.editReply("Unable to obtain general information on the general frequency of obtaining ultrarares in Gobattle. There is a problem with the Gobattle API.");
            return;
        }

        const data = {
            name: "Frostbite Dungeon",
            id: 57,
            level: null,
            ultras: [
                {
                    id: 2,
                    rl: 500,
                    probability: 2.92
                },
                {
                    id: 3,
                    rl: 500,
                    probability: 2.92
                },
                {
                    id: 4,
                    rl: 3000,
                    probability: 17.54
                },
                {
                    id: 6,
                    rl: 4000,
                    probability: 23.39
                },
                {
                    id: 36,
                    rl: 5000,
                    probability: 29.24
                },
                {
                    id: 42,
                    rl: 3000,
                    probability: 17.54
                },
                {
                    id: 116,
                    rl: 100,
                    probability: 0.58
                },
                {
                    id: 168,
                    rl: 10000,
                    probability: 5.85
                }
            ]
        };

        const embed = new EmbedBuilder();

        const dungeon_emoji = "🏰";
        embed.setTitle(`${dungeon_emoji} ${data.name}#${data.id} ${dungeon_emoji}`);

        const header_description = "Here is the list of Ultrarares that you could find in this dungeon:";
        const max_items_by_pages = 8;
        const pages = new Array(Math.ceil(data.ultras.length / max_items_by_pages));
        const unknown_item_emoji = application_emoji_cache.get("item_91") || "📦";
        const id_emoji = application_emoji_cache.get("item_348") || "🏷️";
        const level_emoji = application_emoji_cache.get("compass_item121") || "💪";
        const attendance_emoji = "👥";

        let current_page = -1;
        for (let i = 0; i < data.ultras.length; i++){
            if (Math.floor(i / max_items_by_pages) != current_page){
                current_page++;
                pages[current_page] = "";
            }

            const ultra_data = data.ultras[i];
            const ultra_info = items_map.get(parseInt(ultra_data.id, 10));
            const item_emoji = application_emoji_cache.get(ultra_info?.emoji) || unknown_item_emoji;
            pages[current_page] += `* ${item_emoji} **${restrict_text(ultra_info?.name || "*Unknow?*", 45)}**#${ultra_data.id}: \`RL: ${ultra_data.rl}\` \`PB: ${ultra_data.probability}%\`\n`;
        }

        embed.addFields(
            {name: `> ${id_emoji} __Identifier__`, value: `> ${data.id}`, inline: true},
            {name: `> ${level_emoji} __Recommended level__`, value: `> ${"*Unknow?*"}`, inline: true},
            {name: `> ${attendance_emoji} __Attendance__`, value: `> ${"*Unknow?*"}`, inline: true}
        );
        
        embed.setTimestamp();

        const message_content = "Dev testing...";
        await send_embed_layout(interaction, embed, pages, header_description, message_content);
    }catch(error){
        await interaction.editReply(`Unable to generate template.\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_list(interaction, _client){
    await interaction.deferReply();

    const embed = new EmbedBuilder();
    embed.setTitle("🏰 Dungeon List 🏰");

    const header_description = "Note that this list is not updated in real time unlike other lists. This is a pre-list awaiting the GoBattle.io API update.";
    const max_items_by_pages = 7;
    const pages = new Array(Math.ceil(dungeon_list.length / max_items_by_pages));

    let current_page = -1;
    for (let i = 0; i < dungeon_list.length; i++){
        if (Math.floor(i / max_items_by_pages) != current_page){
            current_page++;
            pages[current_page] = "";
        }

        const dungeon_data = dungeon_list[i];
        pages[current_page] += `* **${restrict_text(dungeon_data.name || "*Unknow?*", 45)}**#${dungeon_data.id}: \`${dungeon_data.min_level || "Unknow?"}💪\`\n`;
    }

    embed.addFields(
        {name: "> 🔢 __Number of dungeons__", value: `> ${dungeon_list.length}`, inline: true},
        {name: "> __Min level__", value: "> 💪", inline: true}
    );

    embed.setTimestamp();

    await send_embed_layout(interaction, embed, pages, header_description);
}

exports.get_dungeon = get_dungeon;
exports.dungeon_command = dungeon_command;
