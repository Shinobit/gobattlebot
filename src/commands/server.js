const {SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType} = require("discord.js");
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

        const header_description = "";
        const max_items_by_pages = 7;
        const pages = new Array(Math.ceil(server_list.length / max_items_by_pages));

        let current_page = -1;
        for (var i = 0; i < server_list.length; i++){
            if (Math.floor(i / max_items_by_pages) != current_page){
                current_page++;
                pages[current_page] = header_description;
            }

            const field = server_list[i];

            let is_online;
            try{
                const response = await fetch(`https://${field.url}:${field.wss || field.ws || field.port}/rtt`);
        
                is_online = response.ok;

                //const data_ping = await response.text();
            }catch(error){
                is_online = false;
            }

            pages[current_page] += `* **${restrict_text(field?.friendlyName, 25)}**#${field?.id}: \`${field?.version} 🔁\` \`${field?.admin} 🛠️\` \`${(is_online ? "Online" : "Down")} 🌐\`\n`;
        }

        current_page = 1;
        embed.setDescription(pages[current_page - 1] || header_description + "***There are no items to display in this list at the moment...***");

        embed.addFields(
            {name: "> 🎮 __Platform__", value: `> ${platform}`, inline: true},
            {name: "> 🔃 __Requested version__", value: `> ${version.toString()}`, inline: true},
            {name: "> __Version__", value: "> 🔁", inline: true},
            {name: "> __Administrator level__", value: "> 🛠️", inline: true},
            {name: "> __Server status__", value: "> 🌐", inline: true}
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
    }catch(error){
        await interaction.editReply(`Unable to retrieve server list.\nContact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

exports.get_server = get_server;
exports.server_command = server_command;
