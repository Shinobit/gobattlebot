const {ChannelType, PermissionFlagsBits, User, Team, Emoji, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType} = require("discord.js");
const level_emojis = require("./level_emojis.json");

const application_emoji_cache = new Map();

function restrict_text(str, nb){
    if (str.length > nb){
        str = str.substring(0, Math.max(0, nb - 3)) + "...";
    }

    return str;
}

function format_score(score){
    score = score.toString();
    const number_digits = score.length;
    let score_formated = score;
    if (number_digits >= 7){
        score_formated = score.substring(0, number_digits - 6);
        
        if (number_digits >= 6 && score[number_digits - 6] != "0"){
            score_formated += "." + score[number_digits - 6];
        }
        score_formated += "m";
    }else if (number_digits >= 4){
        score_formated = score.substring(0, number_digits - 3);
        
        if (number_digits >= 3 && score[number_digits - 3] != "0"){
            score_formated += "." + score[number_digits - 3];
        }
        score_formated += "k";
    }
    
    return score_formated;
}

function format_score_with_commas(score){
    const score_string = score.toString();
    let score_formated = "";
    for (let i = score_string.length - 1, count = 0; i >= 0; i--, count++){
        if (count && count % 3 === 0){
            score_formated = "," + score_formated;
        }
        score_formated = score_string[i] + score_formated;
    }
    
    return score_formated;
}

function format_speed_run_time(time){
    const total_milliseconds = Math.floor(time * 1000);

    const minutes = Math.floor(total_milliseconds / 60000);
    const seconds = Math.floor((total_milliseconds % 60000) / 1000);
    const milliseconds = total_milliseconds % 1000;

    const formatted_minutes = String(minutes).padStart(2, "0");
    const formatted_seconds = String(seconds).padStart(2, "0");
    const formatted_milliseconds = String(milliseconds).padStart(3, "0");

    return `${formatted_minutes}:${formatted_seconds}.${formatted_milliseconds}`;
}

function get_level(exp){
    return Math.floor(Math.pow(exp, 0.5) / 20);
}

function get_level_adventurer(experience){
    return Math.min(20, Math.floor(Math.pow(experience / 100, 1 / 3)) + 1);
}

function get_level_to_emojis(level){
    level = Math.floor(level);

    let emojis = "";

    const landing = Math.floor(level / level_emojis.length);
    for (let i = 0; i < landing; i++){
        emojis += application_emoji_cache.get(level_emojis.at(-1)).toString();
    }

    const rest = level % level_emojis.length;
    if (rest){
        emojis += application_emoji_cache.get(level_emojis[rest - 1]).toString();
    }

    return emojis;
}

function get_utc_date(){
    const today = new Date();
    return new Date(today.getTime() + (today.getTimezoneOffset() * 60000));
}

function get_utf_time_next_king(){
    const utc = get_utc_date();

    const current_day = utc.getDay();
    const days_to_add = current_day == 0 ? 1 : (8 - current_day);
    const next_monday = new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate() + days_to_add, 0, 0, 0));

    return next_monday.getTime();
}

function sum(array){
    let result = 0;
    for (const element of array){
        result += element;
    }
    return result;
}

function get_first_chat_channel(guild, client){
    const everyone = guild.roles.everyone;
    return guild.channels.cache.find((channel) => {
        return channel.type == ChannelType.GuildText &&
        channel.permissionsFor(client.user).has(PermissionFlagsBits.SendMessages) &&
        channel.permissionsFor(everyone).has(PermissionFlagsBits.ViewChannel);
    });
}

async function send_echo(client, message){ 
    const guilds = client.guilds.cache;
    for (const guild of guilds.values()){
        const channel = get_first_chat_channel(guild, client);

        if (channel){
            try{
                await channel.send(message);
            }catch(error){
                console.error(error);
            }
        }
    }
}

function is_my_developer(client, user){
    if (client.application.owner instanceof User){
        return user == client.application.owner;
    }else if (client.application.owner instanceof Team){
        let is_member = false;

        const members_id = client.application.owner.members.keys();
        
        for (const user_id of members_id){
            is_member = user_id == user.id;

            if (is_member){
                return true;
            }
        }
    }
    
    return false;
}

async function update_application_emoji_cache(application){
    const api_version = 10;
    const headers = {
        "Authorization": `Bot ${application.client.token}`
    };

    const response = await fetch(`https://discord.com/api/v${api_version}/applications/${application.id}/emojis`, {method: "GET", headers: headers});
    if (!response.ok){
        return;
    }

    const data = await response.json();
    application_emoji_cache.clear();
    for (const item of data.items){
        const emoji = new Emoji(application.client, item);
        application_emoji_cache.set(emoji.name, emoji);
    }

    return application_emoji_cache;
}

async function send_embed_layout(interaction, embed, pages, header_description = "", content_message){
    let current_page = 1;

    if (header_description){
        header_description += "\n";
    }
    
    embed.setDescription(header_description + (pages[current_page - 1] || "***There are no items to display on this page at the moment...***"));

    const nb_pages = pages.length || 1;

    embed.setFooter({text: `Page ${current_page}/${nb_pages}`});

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
        content: content_message,
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

            embed.setDescription(header_description + pages[current_page - 1]);
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
}

exports.restrict_text = restrict_text;
exports.format_score = format_score;
exports.format_score_with_commas = format_score_with_commas;
exports.format_speed_run_time = format_speed_run_time;
exports.get_level = get_level;
exports.get_level_adventurer = get_level_adventurer;
exports.get_level_to_emojis = get_level_to_emojis;
exports.get_utc_date = get_utc_date;
exports.get_utf_time_next_king = get_utf_time_next_king;
exports.sum = sum;
exports.send_echo = send_echo;
exports.get_first_chat_channel = get_first_chat_channel;
exports.is_my_developer = is_my_developer;
exports.update_application_emoji_cache = update_application_emoji_cache;
exports.send_embed_layout = send_embed_layout;
exports.application_emoji_cache = application_emoji_cache;
