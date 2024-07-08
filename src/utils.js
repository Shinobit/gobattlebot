const {ChannelType, PermissionFlagsBits} = require("discord.js");

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
    return guild.channels.cache.find((channel) => {
        return channel.type == ChannelType.GuildText && channel.permissionsFor(client.user).has(PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages);
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

exports.restrict_text = restrict_text;
exports.format_score = format_score;
exports.format_speed_run_time = format_speed_run_time;
exports.get_level = get_level;
exports.get_level_adventurer = get_level_adventurer;
exports.get_utc_date = get_utc_date;
exports.get_utf_time_next_king = get_utf_time_next_king;
exports.sum = sum;
exports.send_echo = send_echo;
exports.get_first_chat_channel = get_first_chat_channel;
