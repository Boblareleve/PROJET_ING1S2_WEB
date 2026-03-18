const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const express = require('express');
const sqlite3 = require("better-sqlite3");
// const http = require("http");
// const fs = require("fs");
// const sha256 = require('js-sha256');
// const { parseArgs } = require("util");


const { db_get, db_run, db_get_all } = require("./db.js");


const db_auth = new sqlite3("./var/db.db", sqlite3.OPEN_READWRITE); // no create
if (!db_auth) console.error("Can't open database ./var/db.db");
db_auth.pragma("foreign_keys = ON");



const router = express.Router();

router.use(express.json());
router.use(cookieParser());


const JWT_AC_SECRET    = process.env.JWT_SECRET || 'your---secdret-key';
const JWT_RE_SECRET = process.env.JWT_RE_SECRET || 'y--secdret-key';


const token = "token";
const cookie_token_access = "token_access"
const cookie_token_refresh = "token_refresh"

const refresh_timeout = 7 * 24 * 60 * 60 * 1000; // 7d
const access_timeout  = 10 * 60 * 1000;          // 10min







router.delete("/logout", async (req, res) => 
{
    res.clearCookie(cookie_token_refresh);
    res.clearCookie(cookie_token_access);
    
    if (null === delete_db_token(req.cookies.refresh_token))
        return res.status(500).send("can't erase refresh token from database");
    
    res.end();
});



function delete_all_tokens()
{
    if (null === db_run(db_auth, `TRUNCATE TABLE RTokens;`))
        console.error("    Failed to truncate RTokens");
}

function delete_expired_tokens() 
{
    if (null === db_run(db_auth,
        `DELETE FROM RTokens
            WHERE expiration >= ?;`,
            [Date.now()]
    ))
        console.error("    Deleting expiered tokens");
}

function delete_db_token(token) 
{
    let error = true; // noerror
    try {
        const payload = jwt.verify(token, JWT_RE_SECRET);
        const err = quit_game(payload.username);
        if (err !== true)
            console.log(`quit faild: ${err}`);
    }
    catch (err)
    {
        error = null;
    }
    
    if (null === db_run(db_auth,
        `DELETE FROM RTokens WHERE token = ?;`,
        [token]
    ))
        error = null;
    return error; 
}


router.get("/refresh", async (req, res) => 
{
    if (is_connected(req, res))
        res.header(401).send("logged out");

    res.send("token refreshed");
});



function set_cookies(res, access_token, refresh_token)
{
    res.cookie(cookie_token_refresh, refresh_token, {
        httpOnly: true,
        secure: true, // true if using HTTPS
        sameSite: 'Strict',
        maxAge: refresh_timeout // 7d
    })
    res.cookie(cookie_token_access, access_token, {
        httpOnly: true,
        secure: true, // true if using HTTPS
        sameSite: 'Strict',
        maxAge: access_timeout // 10m
    });
}



function validate_username_password(username, password)
{
    const db_user = db_get(db_auth, 
        "SELECT user_name, password_hash FROM Users WHERE user_name = ?;",
         [username]
    );
    if (db_user === null)
    {
        console.error("validate_username_password err("+db_user+"): no user named " + username);
        return "user name not found";
    }
    if (sha256.hex(password) != db_user.password_hash)
    {
        console.error("validate_username_password: password missmatch");
        return "password missmatch";
    }
    return null;
}


function is_token_db_valid(tk)
{
    const db_tk = db_get(db_auth, `
        SELECT token, expire 
        FROM RTokens
        WHERE token = ?;`,
        [tk]
    );
    if (db_tk === null || db_tk === undefined)
        return false;
    // now after expire delete it
    if (Date.now() >= db_tk.expire)
    {
        // console.log("   " + db_tk.expire + " >= " + Date.now());
        // console.log("   " + Date(db_tk.expire) + " >= " + Date(Date.now()));
        // console.log(Date(time_login));
        
        console.log("tk refresh expired: " + tk);
        delete_db_token(tk);
        return false;
    }
    return true;
}


// refresh
function is_connected(req, res)
{
    try {
        const payload = jwt.verify(req.cookies.token_access, JWT_AC_SECRET);
        console.log("is_connected access valid");
        // access is valid
        return payload.username;
    }
    catch (err)
    {
        console.log("is_connected access invalid");

        // console.error("is_connected: " + err);
        if (is_token_db_valid(req.cookies.token_refresh))
        {
            console.log("tk_re in db: "+ req.cookies.token_refresh);
            let payload = null;
            try { payload = jwt.verify(req.cookies.token_refresh, JWT_RE_SECRET); }
            catch (err) {
                console.log("invalid refresh token in db err("+err+") " + req.cookies.token_refresh);
            }
            const username = payload.username;
            
            set_cookies(res, 
                jwt.sign({ username }, JWT_AC_SECRET),
                req.cookies.token_refresh
            );
            // access refreshed
            return username;
        }
        
        console.log(`refresh token ${req.cookies.token_refresh} is not in the db`);
        res.clearCookie(cookie_token_refresh);
        res.clearCookie(cookie_token_access);
        // cookies deleted
        return null;
    }
}


router.post("/login", async (req, res) =>
{
    const username = req.body.username;
    const password = req.body.password;
    console.log(`req.username: ${username}; req.password: ${password}`);
    
    let db_user = null;

    const p_validate = validate_username_password(username, password);
    if (p_validate != null)
        return res.status(401).send(p_validate);

    // delete old log in
    // delete token (to reset his timeout) // done by on confilct
    // if (req.cookies.token_refresh !== undefined 
    //  || req.cookies.token_refresh !== null)
    //     delete_db_token(req.cookies.token_refresh);

    
    // console.log(`geneate new tokens cur refresh: ${req.cookies.token_refresh}`);
    let refresh_token = jwt.sign({ username }, JWT_RE_SECRET);
    let access_token  = jwt.sign({ username }, JWT_AC_SECRET, { expiresIn: access_timeout });
    
    let expire_time = Date.now() + refresh_timeout;
    // console.log("date " + new Date(time_login));
    // console.log("date exp " + new Date(time_login + refresh_timeout));
    // console.log("ts exp " + (refresh_timeout));
    // console.log("ts " + time_login);
    
    let err = db_run(db_auth,
        `INSERT INTO RTokens (token, expire)
            VALUES(?, ?) 
            ON CONFLICT(token) 
            DO UPDATE SET expire = ?;`,

        // `INSERT INTO RTokens (token, expire) 
        //  VALUES (?, ?);`, 
            [refresh_token, expire_time, expire_time]
    );
    if (err === null)
        return res.status(500).send("can't insert refresh token into db");
    

    set_cookies(res, access_token, refresh_token);
    res.send("Logged in successfully");
});


// module.exports = router;
const authRoutes = router;
module.exports = { is_connected, authRoutes };

// console.log("auth.js module: " + JSON.stringify(module.exports));
