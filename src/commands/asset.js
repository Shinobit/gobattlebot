const {SlashCommandBuilder, AttachmentBuilder, EmbedBuilder} = require("discord.js");
const zlib = require("zlib");
const {restrict_text} = require("../utils.js");

const asset_command = new SlashCommandBuilder();
asset_command.setName("asset");
asset_command.setDescription("Command relating to game data files (client side).");
asset_command.addSubcommand((subcommand) => {
    subcommand.setName("info");
	subcommand.setDescription("Get a specific client file.");
    subcommand.addNumberOption((option) => {
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

        let content = "";
        for (let i = 0; i < data.files.length; i++){
            const file = data.files[i];
            const is_compressed = file.file.endsWith("$");
            const file_name = is_compressed ? file.file.slice(0, -1) : file.file;

            content += `#${i + 1} ${file_name}\n`;
        }

        const attachment = new AttachmentBuilder(Buffer.from(content, "utf-8"));
        attachment.name = "asset_list.txt";

        await interaction.editReply({
            content: "# Here is the list of assets with their respective identifiers:",
            files: [attachment]
        });
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
            {name: "> 🔗 __Source__", value: `> [click here](${url.href})`, inline: true},
            {name: "> 🗜️ __Compressed__", value: `> ${is_compressed ? "zlib": "_No_"}`, inline: true},
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
