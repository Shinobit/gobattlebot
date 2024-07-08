const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {restrict_text} = require("../utils.js");

const server_command = new SlashCommandBuilder();
server_command.setName("server");
server_command.setDescription("Commands relating to GoBattle.io game servers.");
server_command.addSubcommand((subcommand) => {
    subcommand.setName("list");
	subcommand.setDescription("Obtain the list of GoBattle.io servers currently listed for the public.");
    subcommand.addStringOption((option) => {
        option.setName("platform");
        option.setDescription("Platform.");
        option.setRequired(false);

        option.setChoices(
            {name: "Web", value: "Web"},
            {name: "iOS", value: "iOS"},
            {name: "Android", value: "Android"}
        );

        return option;
    });
    subcommand.addIntegerOption((option) => {
        option.setName("version");
        option.setDescription("Server version.");
        option.setRequired(false);
        option.setMinValue(1);

        return option;
    });
    subcommand.addNumberOption((option) => {
        option.setName("max_fields");
        option.setDescription("Maximum number of fields.");
        option.setMinValue(1);
        option.setMaxValue(50);
        option.setRequired(false);

        return option;
    });

    return subcommand;
});

async function get_server(interaction, client){
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand){
        case "list":
            await get_list(interaction, client);
            break;
        default:
            await interaction.reply(`Invalid subcommand.\nContact ${client.application.owner} to resolve this issue.`);
    }
}

async function get_list(interaction, client){
    await interaction.deferReply();

    const platform = interaction.options.get("platform")?.value || "Web";
    const version = interaction.options.get("version")?.value || 115;
    const max_fields = interaction.options.get("max_fields")?.value || 20;
    
    try{
        const response = await fetch(`https://gobattle.io/api.php/bootstrap/${version}?platform=${platform}&ud=`);
        
        if (!response.ok){
            await interaction.editReply(`I couldn't get the server list. There is a problem with the Gobattle API.\nContact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const data_json = await response.json();

        const server_list = data_json?.serverlist;

        server_list.push({"id": "8", "version": "115", "friendlyName": "Alpha Server (v115)", "url": "us-west.gobattle.io", "port": "8100", "ws": "9100", "wss": "10100", "admin": "Unknown?"});
        //server_list.push({"id": "50", "version": "115", "friendlyName": "Kuwazy Server", "url": "us-west.gobattle.io", "port": "8102", "ws": "9102", "wss": "10102", "admin": "0"});
        //server_list.push({"id": "147", "version": "114", "friendlyName": "Old France Server (v114)", "url": "france.gobattle.io", "port": "8114", "ws": "9114", "wss": "10114", "admin": "0"});
        //server_list.push({"id": "148", "version": "114", "friendlyName": "Old USA West server (v114)", "url": "us-west.gobattle.io", "port": "8114", "ws": "9114", "wss": "10114", "admin": "0"});
        //server_list.push({"id": "149", "version": "114", "friendlyName": "Old Singapore Server (v114)", "url": "france.gobattle.io", "port": "8114", "ws": "9114", "wss": "10114", "admin": "0"});
    
        const embed = new EmbedBuilder();

        embed.setTitle("🖥️ Server List 🖥️");

        let description = "";
        const list_size = server_list.length;
        for (var i = 0; i < max_fields && i < list_size; i++){
            const field = server_list[i];

            let is_online;
            try{
                const response = await fetch(`https://${field.url}:${field.wss || field.ws || field.port}/rtt`);
        
                is_online = response.ok;

                //const data_ping = await response.text();
            }catch(error){
                is_online = false;
            }

            description += `* ${restrict_text(field?.friendlyName, 25)}: \`${field?.id} 🏷️\` \`${field?.version} 🔁\` \`${field?.admin} 🛠️\` \`${(is_online ? "Online" : "Down")} 🌐\`\n`;
        }

        embed.setDescription(description, {split: false});

        embed.addFields(
            {name: "> 🎮 __Platform__", value: `> ${platform}`, inline: true},
            {name: "> 🔃 __Requested version__", value: `> ${version.toString()}`, inline: true}
        );

        embed.addFields(
            {name: "> __Server ID__", value: "> 🏷️", inline: true},
            {name: "> __Version__", value: "> 🔁", inline: true},
            {name: "> __Administrator level__", value: "> 🛠️", inline: true},
            {name: "> __Server status__", value: "> 🌐", inline: true}
        );

        embed.setTimestamp();

        await interaction.editReply({
            embeds: [embed]
        });
    }catch(error){
        await interaction.editReply(`Unable to retrieve server list.\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

exports.get_server = get_server;
exports.server_command = server_command;
