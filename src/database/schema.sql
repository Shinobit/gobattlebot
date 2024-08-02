CREATE TABLE IF NOT EXISTS user_session (
    discord_user_id INTEGER PRIMARY KEY CHECK (discord_user_id > 0),
    gobattle_user_id INTEGER UNIQUE CHECK (gobattle_user_id > 0),
    session_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP CHECK (
        -- Validating the date format (YYYY-MM-DD HH:MM:SS).
        length(session_date) = 19 AND
        substr(session_date, 1, 4) GLOB "[0-9][0-9][0-9][0-9]" AND
        substr(session_date, 5, 1) = "-" AND
        substr(session_date, 6, 2) GLOB "[0-9][0-9]" AND
        substr(session_date, 8, 1) = "-" AND
        substr(session_date, 9, 2) GLOB "[0-9][0-9]" AND
        substr(session_date, 11, 1) = " " AND
        substr(session_date, 12, 2) GLOB "[0-9][0-9]" AND
        substr(session_date, 14, 1) = ":" AND
        substr(session_date, 15, 2) GLOB "[0-9][0-9]" AND
        substr(session_date, 17, 1) = ":" AND
        substr(session_date, 18, 2) GLOB "[0-9][0-9]"
    ),
    gobattle_token TEXT NOT NULL UNIQUE CHECK (length(gobattle_token) = 64)
) WITHOUT ROWID;