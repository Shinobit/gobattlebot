const {createCanvas, Font} = require("canvas");
const {ChannelType, PermissionFlagsBits} = require("discord.js");

function get_random_int(max){
    return Math.floor(Math.random() * max);
}

function table(table_data, blue_them = false){
    let columns_width = []; // The size of each column.

    for (const row of table_data){
        for (let x = 0; x < row.length; x++){
            const width = row[x].length * 20 + 15;
            if (x > columns_width.length - 1){
                columns_width.push(width);
            }else{
                columns_width[x] = Math.max(columns_width[x], width);
            }
        }
    }

    const height_field = 40;
    const margin = 15;
    const gap_x = 4;
    const gap_y = 2;
    const absolute_width = sum(columns_width) + ((columns_width.length - 1) * gap_x) + margin * 2;
    const absolute_height = (table_data.length * height_field) + ((table_data.length - 1) * gap_y) + margin * 2;

    const canvas = createCanvas(absolute_width, absolute_height);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    let gradient = ctx.createLinearGradient(0, absolute_height, 0, 0);
    // Add three color stops.
    if (blue_them){
        gradient.addColorStop(0, "#002");
        gradient.addColorStop(1, "#115");
    }else{
        gradient.addColorStop(0, "#200");
        gradient.addColorStop(1, "#511");
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, absolute_width, absolute_height);

    gradient = ctx.createLinearGradient(0, absolute_height, 0, 0);
    // Add three color stops.
    if (blue_them){
        gradient.addColorStop(1, "#050527eb");
        gradient.addColorStop(0, "#010113eb");
    }else{
        gradient.addColorStop(1, "#270505eb");
        gradient.addColorStop(0, "#130101eb");
    }
    
    let offset_y = margin;
    for (let j = 0; j < table_data.length; j++){
        let offset_x = margin;
        for (let i = 0; i < columns_width.length; i++){
            if (j){
                ctx.fillStyle = gradient;
            }else if (blue_them){
                ctx.fillStyle = "#04040aed";
            }else{
                ctx.fillStyle = "#0a0404ed";
            }
            ctx.fillRect(offset_x, offset_y, columns_width[i], height_field);
            gobattle_font(ctx, offset_x + 12, offset_y + 28, table_data[j][i], "#fff", 20);
            offset_x += gap_x + columns_width[i];
        }
        offset_y += gap_y + height_field;
    }

    return canvas.toBuffer("image/png");
}

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

function gobattle_font(ctx, x, y, text, color, size, width = undefined){
    ctx.font = `bold ${size}px serif`;
    ctx.fillStyle = color;
    ctx.strokeStyle = "black";
    ctx.lineWidth = size / 4;
    ctx.strokeText(text, x, y, width);
    ctx.strokeText(text, x, y + (size / 7), width);
    ctx.fillText(text, x, y, width);
}

function get_lines(ctx, text, maxWidth){
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth){
            currentLine += " " + word;
        }else{
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);

    return lines;
}

function get_aabb_lines(ctx, lines, line_height = 3){
    const aabb = [0, 0];

    for (const line of lines){
        const metrics = ctx.measureText(line);
        aabb[0] = Math.max(aabb[0], metrics.width);
        const actual_height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        aabb[1] += actual_height;
    }

    if (lines.length > 1){
        aabb[1] += line_height * (lines.length - 1);
    }

    return aabb;
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

exports.get_random_int = get_random_int;
exports.table = table;
exports.restrict_text = restrict_text;
exports.format_score = format_score;
exports.format_speed_run_time = format_speed_run_time;
exports.get_level = get_level;
exports.get_level_adventurer = get_level_adventurer;
exports.get_utc_date = get_utc_date;
exports.get_utf_time_next_king = get_utf_time_next_king;
exports.gobattle_font = gobattle_font;
exports.get_lines = get_lines;
exports.get_aabb_lines = get_aabb_lines;
exports.sum = sum;
exports.send_echo = send_echo;
exports.get_first_chat_channel = get_first_chat_channel;
