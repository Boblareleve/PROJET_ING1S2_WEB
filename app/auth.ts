import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import express from 'express'
import sqlite3 from 'better-sqlite3'

import { createHash } from 'crypto'
// import sha256 from 'js-sha256'

// import path from 'path'


import { db_get, db_run, db_get_all } from "./db/db_wrapper.ts"
import * as role from '../share/role.ts'

const db_auth : BetterSqlite3.Database = new sqlite3(
    // path.resolve(__dirname, "./var/db.db"),
    "./var/db.db",
    sqlite3.OPEN_READWRITE
);

if (!db_auth) console.error("Can't open database ./var/db.db");
db_auth.pragma("foreign_keys = ON");


export const authRouter: Router = express.Router();

authRouter.use(express.json());
authRouter.use(cookieParser());


const JWT_AC_SECRET: string = process.env.JWT_SECRET || 'your---secdret-key';
const JWT_RE_SECRET: string = process.env.JWT_RE_SECRET || 'y--secdret-key';


// const token = "token";
const cookie_token_access: string  = "token_access"
const cookie_token_refresh: string = "token_refresh"

const refresh_timeout: number = 7 * 24 * 60 * 60 * 1000; // 7d
const access_timeout: number  =          10 * 60 * 1000; // 10min




authRouter.delete("/logout", async (req : any, res : any) =>
{
    clear_cookies(res);
    
    if (null === delete_db_token(req.cookies.refresh_token))
        return res.status(500).send("can't erase refresh token from database");
    
    res.end();
});

authRouter.post("/login", async (req : any, res : any) =>
{
    console.log(`req..email: ${req.body.email}; req..password: ${req.body.password}`);
    
    try {
        // all functions called there return a string on error

        let account = get_account(req.body.email);
        if (typeof account === 'string') throw account;

        account = verify_password(account, req.body.password);
        if (typeof account === 'string') throw account;

        account = get_role(account);
        if (typeof account === 'string') throw account;

        const refresh_token = jwt.sign({ email: account.email }, JWT_RE_SECRET);

        const is_in_db = put_token_in_db(account.id, refresh_token);
        if (typeof is_in_db === 'string') throw is_in_db;
        
        set_cookies(res,
            jwt.sign({ email: req.body.email }, JWT_AC_SECRET, { expiresIn: access_timeout }), 
            refresh_token
        );

        console.log("info: " + JSON.stringify(account));
        return res.send(account);
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
    if (null === db_run(db_auth, `TRUNCATE TABLE RTokens;`, []))
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

function delete_db_token(token : string) 
{
    try {
        const payload = jwt.verify(token, JWT_RE_SECRET);

        if (null === db_run(db_auth,
            `DELETE FROM Tokens WHERE token = ?;`,
            [payload /* .TODO */]
        ))
            return null;
    }
    catch (err)
    {
        return null;
    }
    return true; 
}


function set_cookies(res : any, access_token : string, refresh_token : string)
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
function clear_cookies(res : any)
{
    res.clearCookie(cookie_token_refresh);
    res.clearCookie(cookie_token_access);
}
function is_token_db_valid(tk : string)
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

function jwt_verify(token : string, secret : string) : any | null
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
// return user email
export function is_connected(req : any, res : any) : null | string
{
    let tk_access  = req.cookies.token_access;
    let tk_refresh = req.cookies.token_refresh;

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
            console.log("invalid refresh token in db: " + tk_refresh);
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

function get_role(account : role.Account) : role.Account | string
{
    let res : any = null;
    if (res = db_get(db_auth, "SELECT * FROM Companies WHERE id = ?;",    [account.id]) != null)
    {
        account.role = role.ROLE.COMPANY;
        account.info = { url: res.url_site };
        return account; 
    }
    if (res = db_get(db_auth, "SELECT * FROM Admins WHERE id = ?;",       [account.id]) == null)
        return "can't find role";

    
    account.info = {
        first_name: res.first_name,
        last_name: res.last_name,
        info: {}
    };

    if (res = db_get(db_auth, "SELECT * FROM Admins WHERE id = ?;",       [account.id]) != null)
        return { ...account, role: role.ROLE.ADMIN };
    if (res = db_get(db_auth, "SELECT * FROM Supervisors WHERE id = ?;",  [account.id]) != null)
        return { ...account, role: role.ROLE.SUPERVISOR };
    if (res = db_get(db_auth, "SELECT * FROM Students WHERE id = ?;",     [account.id]) != null)
        return { ...account, role: role.ROLE.STUDENT };

    return "can't find role";
}


// get the account row in db
function get_account(email : string) : role.Account | string
{
    const db_account = db_get(db_auth, "SELECT * FROM Accounts WHERE email = ?;", [email]);
    if (db_account === null)
    {
        console.error("create_login_token no email: " + email);
        return "email not found";
    }
    return { ...db_account };
}

function verify_password(account : role.Account, password : string) : role.Account | string
{
    if (account.password_hash != createHash('sha256').update(password).digest('hex')) // sha256.hex(password))
        return "password missmatch";
    account.password_hash = null; // forget for security
    return account;
}

function put_token_in_db(account_id : number, refresh_token : string) : true | string
{
    const expire_time : number = Date.now() + refresh_timeout;
    if (db_run(db_auth,
        `
            INSERT INTO Tokens (account_id, token, expiration)
                VALUES(?, ?, ?)
            ON CONFLICT(token) 
                DO UPDATE SET expiration = ?;
        `,
        [account_id, refresh_token, expire_time, expire_time]
    ) === null)
        return "can't add new refresh token in db";

    return true;
}

// add middelware when connections needed
export function auth(req : any, res : any, next : Function)
{
    req.email = is_connected(req, res);
    if (req.email === null)
    {
        console.log("auth failed");
        return res.status(401).send("disconnected");
    }
    
    console.log(`auth user "${req.email}"`);
    next();
}
