import express from 'express'
import cookieParser from 'cookie-parser'
import type { Account } from '../share/role.ts'
import { ROLE } from '../share/role.ts'


// download files ?
import path from 'path'

import { db_get, db_run, db_get_all } from './db/db_wrapper.ts'
import { auth, get_full_account } from './auth.ts'

export const apiRouter: express.Router = express.Router();


apiRouter.use(express.json());
apiRouter.use(cookieParser());

import sqlite3 from 'better-sqlite3'
const db: sqlite3.Database  = new sqlite3("./var/db.db"); // no create
if (!db) console.error("Can't open database ./var/db.db");
db.pragma("foreign_keys = ON");



// dossier de stage existe
function get_folder(folder : number)
{
    return db_get(db, `SELECT * FROM Internship_files WHERE id = ?;`, [folder]);
}



/* body: {
    title: "abc",
    abstract: "",
    domain: ?,
} */
// -> { title: "abc - [0-9]*" } title can be annoted to unsure it's uniqueness
apiRouter.post('/company/internship', auth, (req: any, res: any) =>
{
    const full_account = get_full_account(req.email);
    if (typeof full_account == 'string')
        return res.status(401).send("failed too find company account informations");
    if (full_account.role !== ROLE.COMPANY)
        return res.status(401).send("only company can create new stage");

    if (db_get(db, `SELECT 1 FROM Internship
                    WHERE title = ?`,
            [req.body.title]) !== null)
    {
        console.log("name conflict 1");
        const base_title = req.body.title;
        let count = 1;
        req.body.title = base_title + " - " + count;
        while (db_get(db, `SELECT 1 FROM Internship
                           WHERE title = ?`,
            [req.body.title]) !== null)
        {
            count++;
            console.log("name conflict " + count);
            req.body.title = base_title + " - " + count;
        }
    }

    if (db_run(db, `
        INSERT INTO Internship (company_id, title, abstract)
            VALUES (?, ?, ?);
        `,
        [full_account.id, req.body.title, req.body.abstract]
    ) === null)
        return res.status(401).send("fail to add row to db");
    
    res.send({ title: req.body.title });
});

/* body: {
    title: "" // need to be exact
} */
apiRouter.delete('/company/internship', auth, (req: any, res: any) =>
{
    const full_account = get_full_account(req.email);
    if (typeof full_account == 'string')
        return res.status(401).send("failed too find company account informations");
    if (full_account.role !== ROLE.COMPANY)
        return res.status(401).send("only company can cancel stages");

    if (db_run(db, `
        DELETE FROM Internship
        WHERE
            company_id = ? AND title = ?;
        `,
        [full_account.id, req.body.title]
    ) !== null)
        return res.status(401).send("fail to find row to delete db");
    
    res.send();
});

/* body: {
    title: ""
    abstract: ""
} */
apiRouter.post('/admin/domain', auth, (req: any, res: any) =>
{
    const full_account = get_full_account(req.email);
    if (typeof full_account == 'string')
        return res.status(401).send("failed too find admin account informations");
    if (full_account.role !== ROLE.ADMIN)
        return res.status(401).send("only admin can add domain");

    if (db_run(db, `
            INSERT INTO Domains (title, abstract)
            VALUES (?, ?);
            `,
            [req.body.title, req.body.abstract]
        ) !== null
    ) {
        return res.status(401).send("con't add domain: '" + req.body.title + "'");
    }

    res.send();
});

/* body: {
    title: ""
    new: {
        title: ""
        abstract: ""
    }
} */
apiRouter.put('/admin/domain', auth, (req: any, res: any) =>
{
    const full_account = get_full_account(req.email);
    if (typeof full_account == 'string')
        return res.status(401).send("failed too find admin account informations");
    if (full_account.role !== ROLE.ADMIN)
        return res.status(401).send("only admin can add domain");

    if (db_run(db, `
            UPDATE Domains 
            SET
                title = ?,
                abstract = ?
            WHERE
                title = ?;
            `,
            [req.body.new.title, req.body.new.abstract, req.body.title]
        ) !== null
    ) {
        return res.status(401).send("can't update domain: '" + req.body.title + "'");
    }

    res.send();
});




apiRouter.get('/me', auth, (req: any, res: any) =>
{
    const full_account = get_full_account(req.email);
    if (typeof full_account == 'string')
        res.status(501).send();
    res.send(full_account);
});

// apiRouter.post('/upload/???')
apiRouter.get('/download/:filename', auth, (req: any, res: any) =>
{
    // sanitize to prevent path traversal attacks (../../etc/passwd)
    const filename = path.basename(req.body.filename);
    if (req.body.filename !== filename)
        return res.status(401).send("bad file name, try sanisize the name");
    
    const folder = path.basename(req.body.filename);

    const db_folder = get_folder(Number(folder));
    if (db_folder === null)
        return res.status(401).send("bad folder id");


    
    const account = get_full_account(req.email);
    if (typeof account === 'string')
    {
        return ;
    }
    
    const file = path.join(__dirname, 'var/storage', folder, filename);
    res.download(file, (err: any) =>
    {
        if (err) res.status(404).json({ error: 'File ' + filename + ' not found' });
    });
})


