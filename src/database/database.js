"use strict";

const sqlite = require("node:sqlite");
const fs = require("fs");

const database = new sqlite.DatabaseSync("database.sqlite");

let add_gobattle_access_statement;
let remove_gobattle_access_statement;
let get_gobattle_token_by_gobattle_user_id_statement;
let get_gobattle_token_by_discord_user_id_statement;
let discord_user_id_to_gobattle_user_id_statement;
let gobattle_user_id_to_discord_user_id_statement;

function init(){
    fs.readFile(__dirname + "/schema.sql", "utf8", function (error, data){
        if (error){
            console.error(error);
            return;
        }

        database.exec(data);

        add_gobattle_access_statement = database.prepare(`
            INSERT INTO user_session (discord_user_id, gobattle_user_id, gobattle_token)
            VALUES ($discord_user_id, $gobattle_user_id, $gobattle_token)
            ON CONFLICT (discord_user_id)
            DO UPDATE SET
                discord_user_id = excluded.discord_user_id,
                gobattle_token = excluded.gobattle_token,
                session_date = CURRENT_TIMESTAMP
            ON CONFLICT (gobattle_user_id)
            DO UPDATE SET
                discord_user_id = excluded.discord_user_id,
                gobattle_token = excluded.gobattle_token,
                session_date = CURRENT_TIMESTAMP;
        `);

        remove_gobattle_access_statement = database.prepare(`
            DELETE FROM user_session WHERE gobattle_user_id = $gobattle_user_id;
        `);

        get_gobattle_token_by_gobattle_user_id_statement = database.prepare(`
            SELECT gobattle_token FROM user_session WHERE gobattle_user_id = $gobattle_user_id;
        `);

        get_gobattle_token_by_discord_user_id_statement = database.prepare(`
            SELECT gobattle_token FROM user_session WHERE discord_user_id = $discord_user_id;
        `);

        discord_user_id_to_gobattle_user_id_statement = database.prepare(`
            SELECT gobattle_user_id FROM user_session WHERE discord_user_id = $discord_user_id;
        `);

        gobattle_user_id_to_discord_user_id_statement = database.prepare(`
            SELECT discord_user_id FROM user_session WHERE gobattle_user_id = $gobattle_user_id;
        `);
        gobattle_user_id_to_discord_user_id_statement.setReadBigInts(true);
    });
}

function add_gobattle_access(discord_user, gobattle_user_id, gobattle_token){
    const discord_user_prime = gobattle_user_id_to_discord_user_id(gobattle_user_id);
    if (discord_user_prime?.toString() == discord_user.id){
        return false;
    }

    add_gobattle_access_statement.run({
        $discord_user_id: BigInt(discord_user.id),
        $gobattle_user_id: gobattle_user_id,
        $gobattle_token: gobattle_token
    });

    return true;
}

function remove_gobattle_access_by_discord_user(discord_user){
    const gobattle_user_id = discord_user_to_gobattle_user_id(discord_user);
    if (!gobattle_user_id){
        return false;
    }

    remove_gobattle_access_statement.run({
        $gobattle_user_id: gobattle_user_id,
    });

    return true;
}

function remove_gobattle_access_by_gobattle_user_id(gobattle_user_id){
    const discord_user_id = gobattle_user_id_to_discord_user_id(gobattle_user_id);
    if (!discord_user_id){
        return false;
    }

    remove_gobattle_access_statement.run({
        $gobattle_user_id: gobattle_user_id,
    });

    return true;
}

function get_gobattle_token_by_gobattle_user_id(gobattle_user_id){
    const data = get_gobattle_token_by_gobattle_user_id_statement.get({
        $gobattle_user_id: gobattle_user_id
    });

    return data?.gobattle_token;
}

function get_gobattle_token_by_discord_user(discord_user){
    const data = get_gobattle_token_by_discord_user_id_statement.get({
        $discord_user_id: discord_user.id
    });

    return data?.gobattle_token;
}

function discord_user_to_gobattle_user_id(discord_user){
    const data = discord_user_id_to_gobattle_user_id_statement.get({
        $discord_user_id: BigInt(discord_user.id)
    });

    return data?.gobattle_user_id;
}

function gobattle_user_id_to_discord_user_id(gobattle_user_id){
    const data = gobattle_user_id_to_discord_user_id_statement.get({
        $gobattle_user_id: gobattle_user_id
    });

    return data?.discord_user_id;
}

exports.init = init;
exports.add_gobattle_access = add_gobattle_access;
exports.remove_gobattle_access_by_discord_user = remove_gobattle_access_by_discord_user;
exports.remove_gobattle_access_by_gobattle_user_id = remove_gobattle_access_by_gobattle_user_id;
exports.get_gobattle_token_by_gobattle_id = get_gobattle_token_by_gobattle_user_id;
exports.get_gobattle_token_by_discord_user = get_gobattle_token_by_discord_user;
exports.discord_user_to_gobattle_user_id = discord_user_to_gobattle_user_id
exports.gobattle_user_id_to_discord_user_id = gobattle_user_id_to_discord_user_id;