const {SlashCommandBuilder} = require("discord.js");
const {get_utf_time_next_king} = require("../utils.js");

const date_new_king_command = new SlashCommandBuilder();
date_new_king_command.setName("get_date_new_king");
date_new_king_command.setDescription("Get the date and time remaining before the next king arrives.");

async function get_date_new_king(interaction, client){
    const utc = Math.floor(get_utf_time_next_king() / 1000);

    await interaction.reply(`New king on <t:${utc}:F> (<t:${utc}:R>).`);
}

exports.get_date_new_king = get_date_new_king;
exports.date_new_king_command = date_new_king_command;
