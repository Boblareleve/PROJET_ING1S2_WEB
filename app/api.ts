import express from 'express'
import cookieParser from 'cookie-parser'
import { ROLE } from '../share/role.ts'

// download files ?
import path from 'path'

import { db_get, db_run, db_get_all } from './db/db_wrapper.ts'
import { auth } from './auth.ts'
export const apiRouter = express.Router();


apiRouter.use(express.json());
apiRouter.use(cookieParser());

import sqlite3 from 'better-sqlite3'
const db = new sqlite3(
    // path.resolve(__dirname, "./var/db.db"),
    "./var/db.db",
    sqlite3.OPEN_READWRITE
); // no create
if (!db) console.error("Can't open database ./var/db.db");
db.pragma("foreign_keys = ON");



// dossier de stage existe
function get_folder(folder : number)
{
    return db_get(db,
        `
            SELECT * FROM Internship_files WHERE id = ?;
        `,
        [folder]
    );
}








function get_(email : string)
{
    const res: Account = {
        id
    };
    get_account();
    get_role();
}


apiRouter.get('/me', auth, (req : any, res : any) =>
{
    const account: Account = { id: 0, email: "", role: 0, info: null };
    res.send(account);
});

apiRouter.get('/download/:filename', auth, (req : any, res : any) =>
{
    // sanitize to prevent path traversal attacks (../../etc/passwd)
    const filename = path.basename(req.body.filename);
    if (req.body.filename !== filename)
        return res.status(401).send("bad file name, try sanisize the name");
    
    const folder = path.basename(req.body.filename);

    const db_folder = get_folder(Number(folder));
    if (db_folder === null)
        return res.status(401).send("bad folder id");


    
    const [ role, account ] = get_role();
    if (typeof role === 'string')
    {
        return ;
    }
    
    const file = path.join(__dirname, 'var/storage', folder, filename);
    res.download(file, (err : any) =>
    {
        if (err) res.status(404).json({ error: 'File ' + filename + ' not found' });
    })
})


