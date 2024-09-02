const {SlashCommandBuilder, PermissionFlagsBits, ActivityType} = require("discord.js");

const setting_command = new SlashCommandBuilder();
setting_command.setName("setting");
setting_command.setDescription("Command relating to my profile settings.");
setting_command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
setting_command.addSubcommand((subcommand) => {
    subcommand.setName("set_avatar");
	subcommand.setDescription("Set my avatar image.");
    subcommand.addAttachmentOption((option) => {
        option.setName("image_file");
        option.setDescription("Avatar image (Recommended file: png, jpeg, gif...)");
        option.setRequired(true);

        return option;
    });

    return subcommand;
});
setting_command.addSubcommand((subcommand) => {
    subcommand.setName("set_banner");
	subcommand.setDescription("Set my banner image.");
    subcommand.addAttachmentOption((option) => {
        option.setName("image_file");
        option.setDescription("Banner image (Recommended file: png, jpeg, gif...)");
        option.setRequired(true);

        return option;
    });

    return subcommand;
});
setting_command.addSubcommand((subcommand) => {
    subcommand.setName("set_username");
	subcommand.setDescription("Changing my username in Discord is heavily rate limited, with only 2 requests every hour!");
    subcommand.addStringOption((option) => {
        option.setName("username");
        option.setDescription("Username.");
        option.setRequired(true);
        option.setMinLength(1);
        option.setMaxLength(32);

        return option;
    });

    return subcommand;
});
setting_command.addSubcommand((subcommand) => {
    subcommand.setName("set_biography");
	subcommand.setDescription("Set my biography.");
    subcommand.addStringOption((option) => {
        option.setName("biography");
        option.setDescription("Biography.");
        option.setRequired(true);
        option.setMinLength(0);
        option.setMaxLength(190);

        return option;
    });

    return subcommand;
});
setting_command.addSubcommand((subcommand) => {
    subcommand.setName("set_activity");
	subcommand.setDescription("Set my activity.");
    subcommand.addStringOption((option) => {
        option.setName("name");
        option.setDescription("Name of the activity.");
        option.setRequired(true);
        option.setMinLength(0);
        option.setMaxLength(190);

        return option;
    });
    subcommand.addStringOption((option) => {
        option.setName("state");
        option.setDescription("State of the activity.");
        option.setRequired(false);
        option.setMinLength(0);
        option.setMaxLength(190);

        return option;
    });
    subcommand.addNumberOption((option) => {
        option.setName("type");
        option.setDescription("Type of the activity.");
        option.setRequired(false);
        option.addChoices(
            {name: "Competing", value: ActivityType.Competing},
            {name: "Listening", value: ActivityType.Listening},
            {name: "Playing", value: ActivityType.Playing},
            {name: "Streaming", value: ActivityType.Streaming},
            {name: "Watching", value: ActivityType.Watching},
            {name: "Custom", value: ActivityType.Custom}
        );

        return option;
    });
    subcommand.addStringOption((option) => {
        option.setName("url");
        option.setDescription("Twitch / YouTube stream URL.");
        option.setRequired(false);
        option.setMinLength(0);
        option.setMaxLength(190);

        return option;
    });

    return subcommand;
});
setting_command.addSubcommand((subcommand) => {
    subcommand.setName("set_afk");
	subcommand.setDescription("Sets/removes my AFK flag.");
    subcommand.addBooleanOption((option) => {
        option.setName("is_afk");
        option.setDescription("Is AFK?");
        option.setRequired(true);

        return option;
    });

    return subcommand;
});
setting_command.addSubcommand((subcommand) => {
    subcommand.setName("set_status");
	subcommand.setDescription("Set my status.");
    subcommand.addStringOption((option) => {
        option.setName("status");
        option.setDescription("Status.");
        option.setRequired(true);
        option.addChoices(
            {name: "Online", value: "online"},
            {name: "Invisible", value: "invisible"},
            {name: "Idle", value: "idle"},
            {name: "Dnd", value: "dnd"}
        );

        return option;
    });

    return subcommand;
});

async function get_setting(interaction, client){
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand){
        case "set_avatar":
            await get_set_avatar(interaction, client);
            break;
        case "set_banner":
            await get_set_banner(interaction, client);
            break;
        case "set_username":
            await get_set_username(interaction, client);
            break;
        case "set_biography":
            await get_set_biography(interaction, client);
            break;
        case "set_activity":
            await get_set_activity(interaction, client);
            break;
        case "set_afk":
            await get_set_afk(interaction, client);
            break;
        case "set_status":
            await get_set_status(interaction, client);
            break;
        default:
            await interaction.reply(`Invalid subcommand.\nContact ${client.application.owner} to resolve this issue.`);
    }
}

async function get_set_avatar(interaction, client){
    await interaction.deferReply();

    try{
        const attachment = interaction.options.get("image_file")?.attachment;

        const response = await fetch(attachment.url);

        if (!response.ok){
            await interaction.editReply(`The avatar image was not set successfully.\nUnable to retrieve image from Discord CDN.\nIf the problem persists, contact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const array_buffer = await response.arrayBuffer();
        const buffer = Buffer.from(array_buffer);

        await client.user.setAvatar(buffer);
        await interaction.editReply("The avatar image has been successfully set. Changes may take time to appear.");
    }catch (error){
        await interaction.editReply(`The avatar image was not set successfully.\nVerify that the file is an image type accepted by Discord.\nIf the problem persists, contact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_set_banner(interaction, client){
    await interaction.deferReply();

    try{
        const attachment = interaction.options.get("image_file")?.attachment;

        const response = await fetch(attachment.url);

        if (!response.ok){
            await interaction.editReply(`The banner image was not set successfully.\nUnable to retrieve image from Discord CDN.\nIf the problem persists, contact ${client.application.owner} to resolve this issue.`);
            return;
        }

        const array_buffer = await response.arrayBuffer();
        const buffer = Buffer.from(array_buffer);

        await client.user.setBanner(buffer); // Do not work?
        await interaction.editReply("The banner image has been successfully set. Changes may take time to appear.");
    }catch (error){
        await interaction.editReply(`The banner image was not set successfully.\nVerify that the file is an image type accepted by Discord.\nIf the problem persists, contact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_set_username(interaction, client){
    await interaction.deferReply();

    try{
        const username = interaction.options.get("username")?.value;

        await client.user.setUsername(username);
        await interaction.editReply("Username has been successfully set. Changes may take time to appear.");
    }catch (error){
        await interaction.editReply(`Username was not set successfully.\nSets the username of the logged in client. Changing usernames in Discord is heavily rate limited, with only 2 requests every hour. Use this sparingly!\nIf the problem persists, contact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_set_biography(interaction, client){
    await interaction.deferReply();

    // Do not work? NAHHHHHHHHHHHHHHH Why Discord Why!!! ):
    /*
    // The code if against is prohibited by discord:
    try{
        const biography = interaction.options.get("biography")?.value;

        const api_version = 14;
        const url = `https://discord.com/api/${api_version}/users/@me`;

        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                "Authorization": process.env.TOKEN,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({bio: biography})
        });
        
        if (!response.ok){
            await interaction.editReply(`Biography was not set successfully.\nIf the problem persists, contact ${client.application.owner} to resolve this issue.`);
            console.error(response);
            return;
        }

        await interaction.editReply("Biography has been successfully set. Changes may take time to appear.");
    }catch (error){
        await interaction.editReply(`Biography was not set successfully.\nIf the problem persists, contact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
    */

    await interaction.editReply("The Discord API doesn't let you do this properly. Wait for Discord to update its API.");
}

async function get_set_activity(interaction, client){
    await interaction.deferReply();

    try{
        const name_value = interaction.options.get("name")?.value;
        const state_value = interaction.options.get("state")?.value;
        const type_value = interaction.options.get("type")?.value;
        const url_value = interaction.options.get("url")?.value;

        await client.user.setActivity({name: name_value, state: state_value, type: type_value, url: url_value});
        await interaction.editReply("Activity has been successfully set. Changes may take time to appear.");
    }catch (error){
        await interaction.editReply(`Activity was not set successfully.\nCheck that the settings options are consistent with each other.\nIf the problem persists, contact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_set_afk(interaction, client){
    await interaction.deferReply();

    try{
        const afk_value = interaction.options.get("is_afk")?.value;

        client.user.setAFK(afk_value);
        await interaction.editReply("AFK status has been successfully set. Changes may take time to appear.");
    }catch (error){
        await interaction.editReply(`AFK status was not set successfully.\nIf the problem persists, contact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

async function get_set_status(interaction, client){
    await interaction.deferReply();

    try{
        const status_value = interaction.options.get("status")?.value;

        client.user.setStatus(status_value);
        await interaction.editReply("Status has been successfully set. Changes may take time to appear.");
    }catch (error){
        await interaction.editReply(`Status was not set successfully.\nIf the problem persists, contact ${client.application.owner} to resolve this issue.`);
        console.error(error);
    }
}

exports.get_setting = get_setting;
exports.setting_command = setting_command;
