const {SlashCommandBuilder} = require("discord.js");

const ultrarare_drop_chance_command = new SlashCommandBuilder();
ultrarare_drop_chance_command.setName("get_ultrarare_drop_chance");
ultrarare_drop_chance_command.setDescription("Calculate the probability of an ultra falling into a chest based on a level of luck.");
ultrarare_drop_chance_command.addNumberOption((option) => {
    option.setName("luck");
    option.setDescription("Level of luck.");
    option.setMinValue(0);
    option.setMaxValue(20);
    option.setRequired(true);

    return option;
});

async function get_ultrarare_drop_chance(interaction, client){
    const BASE = 0.6;
    const STEP_LEVEL = 0.05;
    
    const luck = interaction.options.get("luck")?.value || 0;
    const result = BASE + STEP_LEVEL * luck;

    await interaction.reply(`You have an \`${result.toPrecision(2)}%\` chance of getting an Ultrarare from a chest with a LUCK level of ${luck}.`);
}

exports.get_ultrarare_drop_chance = get_ultrarare_drop_chance;
exports.ultrarare_drop_chance_command = ultrarare_drop_chance_command;
