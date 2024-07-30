const {EmbedBuilder, AttachmentBuilder, SlashCommandBuilder} = require("discord.js");
const {restrict_text, is_my_developer} = require("../utils.js");

const user_command = new SlashCommandBuilder();
user_command.setName("user");
user_command.setDescription("Command relating to users in the game.");
user_command.addSubcommand((subcommand) => {
    subcommand.setName("info");
	subcommand.setDescription("Get general information about a user.");
    subcommand.addNumberOption((option) => {
        option.setName("user_id");
        option.setDescription("The user identifier.");
        option.setMinValue(1);
        option.setRequired(true);

        return option;
    });

    return subcommand;
});
user_command.addSubcommand((subcommand) => {
    subcommand.setName("king");
	subcommand.setDescription("Get general information about the current king.");

    return subcommand;
});
user_command.addSubcommand((subcommand) => {
    subcommand.setName("bank");
	subcommand.setDescription("Get the list of items contained in a game user's bank.");

    subcommand.addNumberOption((option) => {
        option.setName("user_id");
        option.setDescription("The user identifier.");
        option.setMinValue(1);
        option.setRequired(true);

        return option;
    });

    subcommand.addNumberOption((option) => {
        option.setName("index_book");
        option.setDescription("Index of the bank book to consult.");
        option.setMinValue(1);
        option.setMaxValue(6);
        option.setRequired(true);

        return option;
    });

    return subcommand;
});
user_command.addSubcommand((subcommand) => {
    subcommand.setName("inventory");
	subcommand.setDescription("Get the list of items contained in a game user's inventory.");

    subcommand.addNumberOption((option) => {
        option.setName("user_id");
        option.setDescription("The user identifier.");
        option.setMinValue(1);
        option.setRequired(true);

        return option;
    });

    return subcommand;
});

async function get_user(interaction, client){
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand){
        case "info":
            await get_info(interaction, client);
            break;
        case "king":
            await get_king(interaction, client);
            break;
        case "bank":
            await get_bank(interaction, client);
            break;
        case "inventory":
            await get_inventory(interaction, client);
            break;
        default:
            await interaction.reply(`Invalid subcommand.\nContact ${client.application.owner} to resolve this issue.`);
    }
}

async function get_info(interaction, client){
    await interaction.deferReply();

    try{
        const user_id = interaction.options.get("user_id")?.value;
        const public = false;
        
        if (!is_my_developer(client, interaction.user) && !public){
            await interaction.editReply(`Sorry, user _#${user_id}_ does not wish to expose this information to the public.`);
            return;
        }

        const embed = new EmbedBuilder();
        embed.setTitle(restrict_text("Kuwazy", 60));
        embed.setThumbnail("attachment://head.png");
        embed.setDescription(restrict_text("_This user has no description..._", 250));
        embed.setColor(0x500000);

        embed.addFields(
            {name: "> 🏷️ __ID__", value: `> ${user_id.toString()}`, inline: true},
            {name: "> 🪙 __Coins__", value: `> ${"2,283,520"}`, inline: true},
            {name: "> 💎 __Diamonds__", value: `> ***${(27).toString()}***`, inline: true}
        );

        embed.addFields(
            {name: "> 💪 __LVL__", value: `> ${"174"}`, inline: true},
            {name: "> 🛠️ __EXP__", value: `> ${"92026/139600"}`, inline: true},
            {name: "> 🔱 __REP__", value: `> ${"17"}`, inline: true}
        );

        embed.addFields(
            {name: "> ⚔️ __ATT__", value: `> ${"+17"}`, inline: true},
            {name: "> 🛡️ __DEF__", value: `> ${"+19"}`, inline: true},
            {name: "> 🍀 __LCK__", value: `> ${"+9"}`, inline: true}
        );

        embed.addFields(
            {name: "> ❤️ __MHP__", value: `> ${"+11"}`, inline: true},
            {name: "> ❤️‍🩹 __RGN__", value: `> ${"+6"}`, inline: true},
            {name: "> ⚡ __SPD__", value: `> ${"+13"}`, inline: true}
        );

        embed.addFields(
            {name: "> 💯 __ADV Score__", value: `> ${"5630"}`, inline: true},
            {name: "> 💪 __ADV LVL__", value: `> ${"5"}`, inline: true},
            {name: "> 🤠 __ADV Rank__", value: `> ${"124587"}`, inline: true}
        );

        embed.addFields(
            {name: "> 🔔 __Status__", value: `> ${"Connected"}`, inline: true},
            {name: "> 🌐 __Server__", value: `> ${"France Server"}`, inline: true},
            {name: "> 🎖 __Role__", value: `> ${"Player"}`, inline: true}
        );

        embed.addFields(
            {name: "> 🔇 __Is Muted__", value: `> ${"No"}`, inline: true},
            {name: "> 🚫 __Is Banned__", value: `> ${"No"}`, inline: true},
            {name: "> 👑 __Is King__", value: `> ${"No"}`, inline: true}
        );

        embed.setFooter({text: "Last connection"});
        embed.setTimestamp();

        const attachment = new AttachmentBuilder(__dirname + "/../images/mr_strong_head.png");
        attachment.name = "head.png";

        await interaction.editReply({
            files: [attachment],
            embeds: [embed],
            content: "This feature is under development. This is just an example of a template."
        });
    }catch(error){
        await interaction.editReply(`Unable to retrieve information on this user.\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_king(interaction, client){
    await interaction.reply("This subcommand is currently under development. You cannot use it at the moment.");
}

async function get_bank(interaction, client){
    const user_id = interaction.options.get("user_id")?.value;
    await interaction.reply("This subcommand is currently under development. You cannot use it at the moment.");
}

async function get_inventory(interaction, client){
    const user_id = interaction.options.get("user_id")?.value;
    await interaction.reply("This subcommand is currently under development. You cannot use it at the moment.");
}

exports.get_user = get_user;
exports.user_command = user_command;
