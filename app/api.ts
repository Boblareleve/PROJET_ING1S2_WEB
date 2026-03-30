const express = require('express');
const cookieParser = require('cookie-parser');
const { ROLE } = require('../share/role.js');

// download files ?
const path = require('path');

const { db_get, db_run, db_get_all } = require('./db_wrapper.js');
const { auth, authRouter } = require('./auth.js');
const router  = express.Router();

router.use(express.json());
router.use(cookieParser());

const sqlite3 = require('better-sqlite3');
const db = new sqlite3("./var/db.db", sqlite3.OPEN_READWRITE); // no create
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


interface Persons {
    first_name : string,
    last_name : string
};

interface Companies {
    url : string
};


interface Account {
    id    : number,
    email : string,
    role  : number, // ROLE
    info  : Persons | Companies,
};

function get_(email : string)
{
    const res: Account = {
        id
    };
    get_account();
    get_role();
}


router.get('/me', auth, (req : any, res : any) =>
{
    const account: Account = {};
    res.send(account);
});

router.get('/download/:filename', auth, (req : any, res : any) =>
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


module.exports = { apiRouter: router, authRouter };


