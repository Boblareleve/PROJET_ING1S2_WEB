const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const express = require('express');
const sqlite3 = require("better-sqlite3");


const { db_get, db_run, db_get_all } = require("./db_wrapper.js");
const { ROLE } = require('./role.js');

const db_auth = new sqlite3("./var/db.db", sqlite3.OPEN_READWRITE); // no create
if (!db_auth) console.error("Can't open database ./var/db.db");
db_auth.pragma("foreign_keys = ON");



const router = express.Router();

router.use(express.json());
router.use(cookieParser());


const JWT_AC_SECRET    = process.env.JWT_SECRET || 'your---secdret-key';
const JWT_RE_SECRET = process.env.JWT_RE_SECRET || 'y--secdret-key';


const token = "token";
const cookie_token_access  = "token_access"
const cookie_token_refresh = "token_refresh"

const refresh_timeout = 7 * 24 * 60 * 60 * 1000; // 7d
const access_timeout  = 10 * 60 * 1000;          // 10min




router.delete("/logout", async (req, res) =>
{
    clear_cookies(res);
    
    if (null === delete_db_token(req.cookies.refresh_token))
        return res.status(500).send("can't erase refresh token from database");
    
    res.end();
});

router.post("/login", async (req, res) =>
{
    console.log(`req..email: ${req.body.email}; req..password: ${req.body.password}`);
    
    try {
        // all functions called there return a string on error

        const account = get_account(req.body.email);
        if (typeof account === 'string') throw account;

        const is_account_verified = verify_password(account, req.body.password);
        if (typeof is_account_verified === 'string') throw is_account_verified;

        const role = get_role(account);
        if (typeof role === 'string') throw role;

        const refresh_token = jwt.sign({ email: account.email }, JWT_RE_SECRET);

        const is_in_db = put_token_in_db(account.id, refresh_token);
        if (typeof is_in_db === 'string') throw is_in_db;
        

        set_cookies(res,
            jwt.sign({ email: req.body.email }, JWT_AC_SECRET, { expiresIn: access_timeout }), 
            refresh_token
        );

        return res.send({ role: role });
    }
    catch (err)
    {
        console.error(err);
        clear_cookies(res);
        return res.status(500).send(err);
    }
});


// router.get("/refresh", async (req, res) => 
// {
//     if (is_connected(req, res))
//         res.header(401).send("logged out");

//     res.send("token refreshed");
// });




function delete_all_tokens()
{
    if (null === db_run(db_auth, `TRUNCATE TABLE RTokens;`))
        console.error("Failed to truncate RTokens");
}

function delete_expired_tokens() 
{
    if (null === db_run(db_auth,
        `DELETE FROM RTokens
            WHERE expiration >= ?;`,
            [Date.now()]
    ))
        console.error("Deleting expiered tokens");
}

function delete_db_token(token) 
{
    try {
        const payload = jwt.verify(token, JWT_RE_SECRET);

        if (null === db_run(db_auth,
            `DELETE FROM Tokens WHERE token = ?;`,
            [playload /* .TODO */]
        ))
            return null;
    }
    catch (err)
    {
        return null;
    }
    return true; 
}


function set_cookies(res, access_token, refresh_token)
{
    res.cookie(cookie_token_refresh, refresh_token, {
        httpOnly: true,
        secure: true, // true if using HTTPS
        sameSite: 'Strict',
        // maxAge: refresh_timeout // 7d only managed with db Tokens table
    })
    res.cookie(cookie_token_access, access_token, {
        httpOnly: true,
        secure: true, // true if using HTTPS
        sameSite: 'Strict',
        maxAge: access_timeout // 10m
    });
}
function clear_cookies(res)
{
    res.clearCookie(cookie_token_refresh);
    res.clearCookie(cookie_token_access);
}
function is_token_db_valid(tk)
{
    const db_tk = db_get(db_auth, `
        SELECT expiration 
        FROM Tokens
        WHERE token = ?;`,
        [tk]
    );
    if (db_tk === null)
        return false;

    // if it expire delete it
    if (Date.now() >= db_tk.expiration)
    {
        console.log("tk refresh expired: " + tk);
        delete_db_token(tk);
        return false;
    }
    return true;
}

function jwt_verify(token, secret)
{
    try
    {
        return jwt.verify(token, secret);
    } catch (err)
    {
        return null;
    }
}

// refresh access token if necessary
// null on error
function is_connected(req, res)
{
    let tk_access  = res.cookies.token_access;
    let tk_refresh = res.cookies.token_refresh;

    let payload = jwt_verify(tk_access, JWT_AC_SECRET);
    if (payload === null)
    {
        console.log("is_connected access invalid");

        if (!is_token_db_valid(tk_refresh))
        {
            console.log(`refresh token ${tk_refresh} is not in the db`);
            clear_cookies(res);
            return null;
        }

        payload = jwt_verify(tk_refresh, JWT_RE_SECRET);
        if (payload === null)
        {
            console.log("invalid refresh token in db err("+err+") " + tk_refresh);
            clear_cookies(res);
            return null;
        }
        
        // access refreshed
        tk_access = jwt.sign({ email: payload.email }, JWT_AC_SECRET, { expiresIn: access_timeout });
        console.log("\tOK");
    }

    set_cookies(res,
        tk_access,
        tk_refresh
    );
    return payload.email;
}


function get_role(account)
{
    if (db_get(db_auth, "SELECT FROM Admins WHERE id = ?;", [account.id]) != null)
        return ROLE.ADMIN;
    if (db_get(db_auth, "SELECT FROM Supervisors WHERE id = ?;", [account.id]) != null)
        return ROLE.SUPERVISOR;
    if (db_get(db_auth, "SELECT FROM Students WHERE id = ?;", [account.id]) != null)
        return ROLE.STUDENT;
    if (db_get(db_auth, "SELECT FROM Companies WHERE id = ?;", [account.id]) != null)
        return ROLE.COMPANY;
    return "can't find role";
}

function get_account(email)
{
    const account = db_get(db_auth, "SELECT * FROM Accounts WHERE email = ?;", [email]);
    if (account === null)
    {
        console.error("create_login_token err("+account+"): no email: " + email);
        return "email not found";
    }
    return account;
}

function verify_password(account, password)
{   
    if (account.password_hash != sha256.hex(password))
        return "password missmatch";
    return account;
}

function put_token_in_db(account_id, refresh_token) 
{
    const expire_time = Date.now() + refresh_timeout;
    if (db_run(db_auth,
        `
            INSERT INTO Tokens (account_id, token, expiration)
                VALUES(?, ?, ?)
            ON CONFLICT(token) 
                DO UPDATE SET expiration = ?;
        `,
        [...[account_id, refresh_token, expire_time], expire_time]
    ) === null)
        return "can't add new refresh token in db";

    return true;
}



// module.exports = router;
const authRoutes = router;
module.exports = { is_connected, authRoutes };

// console.log("auth.js module: " + JSON.stringify(module.exports));
