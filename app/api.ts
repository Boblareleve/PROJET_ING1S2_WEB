// file: api.ts

import express from 'express'
import cookieParser from 'cookie-parser'
import type { Account } from '../share/role.ts'
import { ROLE } from '../share/role.ts'
import { createHash } from 'crypto';

import multer from 'multer'
import fs from 'fs'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './var/storage/';
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const upload = multer({ storage });


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


function m_full_account(req : any, res : any, next : Function)
{
    req.full_account = get_full_account(req.email);
    if (typeof req.full_account === 'string')
        return res.status(401).send("failed too find account informations");
    
    next();
}


/* body: {
    title: "abc",
    abstract: "",
    domain: ?,
} */
// -> { title: "abc - [0-9]*" } title can be annoted to unsure it's uniqueness
apiRouter.post('/company/internship', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.COMPANY)
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

    const domain = db_get(db, `SELECT id FROM Domains WHERE title = ?`, [req.body.domain]);
    if (domain ===  null)
        return res.status(400).send("domain '"+ req.body.domain +"' not found");

    if (!db_run(db, `
        INSERT INTO Internship (company_id, domain_id, title, abstract)
            VALUES (?, ?, ?, ?);
        `,
        [req.full_account.id, domain.id, req.body.title, req.body.abstract]
    ))
        return res.status(401).send("fail to add row to db");
    
    res.send({ title: req.body.title });
});

/* body: {
    title: "" // need to be exact
} */
apiRouter.delete('/company/internship', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.COMPANY)
        return res.status(401).send("only company can cancel stages");

    if (!db_run(db, `
        DELETE FROM Internship
        WHERE
            company_id = ? AND title = ?;
        `,
        [req.full_account.id, req.body.title]
    ))
        return res.status(401).send("fail to find row to delete db");
    
    res.send();
});

/* body: {
    title: ""
    abstract: ""
} */
apiRouter.post('/admin/domain', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.ADMIN)
        return res.status(401).send("only admin can add domain");

    if (db_get(db, `SELECT 1 FROM Domains WHERE title = ?;`, [req.body.title]) !== null)
        return res.status(409).send("domain '" + req.body.title + "' already exists");

    if (!db_run(db, `
            INSERT INTO Domains (title, abstract)
            VALUES (?, ?);
            `,
            [req.body.title, req.body.abstract]
        )
    ) {
        return res.status(500).send("can't add domain: '" + req.body.title + "'");
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
apiRouter.put('/admin/domain', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.ADMIN)
        return res.status(401).send("only admin can add domain");

    if (!db_run(db, `
            UPDATE Domains 
            SET
                title = ?,
                abstract = ?
            WHERE
                title = ?;
            `,
            [req.body.new.title, req.body.new.abstract, req.body.title]
        )
    ) {
        return res.status(401).send("can't update domain: '" + req.body.title + "'");
    }

    res.send();
});

/* body: {
    domain: "", // title exact
    date: { // date of begining
        min: unix-time, 
        max: unix-time
    },
    duration: unix-time,
    fuzzy: "" // title / abstract 
} */
// --> [{ domain: "title", company: "name",  }]
const duration_margin = 1;
apiRouter.post('/query/internship', auth, (req: any, res: any) =>
{
    let query = `
        SELECT * FROM Internship
        WHERE
    `;
    let params = [];

    if (req.body.domain !== null)
    {
        console.log("domain: " + req.body.domain);
        const domain = db_get(db, `SELECT id FROM Domains WHERE title = ?`, [req.body.domain]);
        if (domain === null)
            return res.status(400).send("domain not found (" + req.body.domain + ")");
        console.log("domain_id: " + domain.id);
        query += `domain_id = ? AND `;
        params.push(domain.id);
    }
    if (req.body.date !== null)
    {
        console.log("date: " + JSON.stringify(req.body.date))
        query += `min_begin < ? AND ? < max_begin AND `;
        params.push(req.body.date.max);
        params.push(req.body.date.min);
    }
    if (req.body.duration !== null)
    {
        console.log("duration: " + req.body.duration);
        query += `ABS(duration - ?) <= 1 AND `;
        params.push(req.body.duration);
    }
    query += `TRUE `;

    let found = db_get_all(db, query, params);
    if (found === null)
        found = [];

    let parsed = [];

    for (let index = 0; index < found.length; index++) {
        const element = found[index];
        
        parsed.push({
            id: element.id,
            domain:  db_get(db, `SELECT title        FROM Domains   WHERE id = ?`,  [element.domain_id]),
            company: db_get(db, `SELECT name_company FROM Companies WHERE id = ?`, [element.company_id]),
            title: element.title,
            abstract: element.abstract,
            min_begin: element.min_begin,
            max_begin: element.max_begin,
            duration: element.duration
        })
    }
    
    res.send(parsed);
});


apiRouter.post('/student/apply', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.STUDENT)
        return res.status(401).send("only students can apply");

    const internship = db_get(db,
        `SELECT id FROM Internship WHERE id = ?;`,
        [req.body.internship_id]
    );
    if (internship === null)
        return res.status(404).send("internship not found");

    if (db_get(db,
        `SELECT 1 FROM Internship_files WHERE student_id = ? AND internship_id = ?;`,
        [req.full_account.id, internship.id]
    ) !== null)
        return res.status(409).send("already applied to this internship");

    try {
        db.prepare(
            `INSERT INTO Internship_files (student_id, internship_id) VALUES (?, ?);`
        ).run(req.full_account.id, internship.id);
    } catch (err: any) {
        console.error("apply error:", err.message);
        return res.status(500).send("failed to apply");
    }

    res.send();
});


apiRouter.get('/me', auth, m_full_account, (req: any, res: any) =>
{
    res.send(req.full_account);
});

// apiRouter.post('/upload/???')
// apiRouter.get('/download/:filename', auth, (req: any, res: any) =>
// {
//     // sanitize to prevent path traversal attacks (../../etc/passwd)
//     const filename = path.basename(req.body.filename);
//     if (req.body.filename !== filename)
//         return res.status(401).send("bad file name, try sanisize the name");
// 
//     const folder = path.basename(req.body.filename);
// 
//     const db_folder = get_folder(Number(folder));
//     if (db_folder === null)
//         return res.status(401).send("bad folder id");
// 
// 
// 
//     const account = get_full_account(req.email);
//     if (typeof account === 'string')
//         return res.status(401).send("could not get full account info of email: '" + req.email + "'");
// 
// 
//     const file = path.join(__dirname, 'var/storage', folder, filename);
//     res.download(file, (err: any) =>
//     {
//         if (err) res.status(404).json({ error: 'File ' + filename + ' not found' });
//     });
// })


// DOMAINES 

// GET /api/query/domains
// -> [{ id, title, abstract }]
apiRouter.get('/query/domains', auth, (req: any, res: any) =>
{
    let domains = db_get_all(db, `SELECT * FROM Domains;`, []);
    if (domains === null)
        domains = [];
    res.send(domains);
});

// DELETE /api/admin/domain
// body: { title: "" }
apiRouter.delete('/admin/domain', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.ADMIN)
        return res.status(401).send("only admin can delete domains");

    try {
        const result = db.prepare(`DELETE FROM Domains WHERE title = ?;`).run([req.body.title]);
        if (result.changes === 0)
            return res.status(404).send("domain '" + req.body.title + "' not found");
    } catch (err) {
        return res.status(500).send("can't delete domain: '" + req.body.title + "'");
    }

    res.send();
});


// COMPANY

// GET /api/company/internship
// -> [{ title, abstract, domain, min_begin, max_begin, duration }]
apiRouter.get('/company/internship', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.COMPANY)
        return res.status(401).send("only company can list their internships");
    
    let internships = db_get_all(db,
        `SELECT i.*, d.title AS domain_title
         FROM Internship i
         LEFT JOIN Domains d ON i.domain_id = d.id
         WHERE i.company_id = ?;`,
        [req.full_account.id]
    );
    if (internships === null)
        internships = [];

    res.send(internships);
});

// GET /api/company/applicants/:title
// -> [{ student_id, first_name, last_name, email, applied_at }]
apiRouter.get('/company/applicants/:title', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.COMPANY)
        return res.status(401).send("only company can view applicants");

    const internship = db_get(db,
        `SELECT id FROM Internship WHERE company_id = ? AND title = ?;`,
        [req.full_account.id, req.params.title]
    );
    if (internship === null)
        return res.status(404).send("internship not found or not yours");

    let applicants = db_get_all(db,
        `SELECT inf.id, inf.student_id, inf.status, acc.email,
         p.first_name, p.last_name
         FROM Internship_files inf
         JOIN Accounts acc ON acc.id = inf.student_id
         LEFT JOIN Persons p ON p.id = inf.student_id
         WHERE inf.internship_id = ?;`,
        [internship.id]
    );
    if (applicants === null)
        applicants = [];

    res.send(applicants);
});

apiRouter.put('/company/application/status', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.COMPANY)
        return res.status(401).send("only company can update application status");

    const internship_file_id = req.body.internship_file_id ?? req.body.id;
    const { status } = req.body;

    console.log("full_account:", JSON.stringify(req.full_account));
    console.log("internship_file_id:", internship_file_id, "status:", status);

    if (!['accepted', 'rejected'].includes(status))
        return res.status(400).send("invalid status");

    const owns = db_get(db,
        `SELECT 1 FROM Internship_files inf
         JOIN Internship i ON i.id = inf.internship_id
         WHERE inf.id = ? AND i.company_id = ?;`,
        [internship_file_id, req.full_account.id]
    );

    console.log("owns:", owns);

    if (owns === null)
        return res.status(403).send("not your internship - file_id:" + internship_file_id + " company_id:" + req.full_account.id);

    try {
        db.prepare(`UPDATE Internship_files SET status = ? WHERE id = ?;`)
          .run(status, internship_file_id);
    } catch (err: any) {
        return res.status(500).send("can't update status: " + err.message);
    }

    res.send();
}); 

// PUT /api/company/internship/dates
// body: { title: "", min_begin: unix, max_begin: unix, duration: number }
apiRouter.put('/company/internship/dates', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.COMPANY)
        return res.status(401).send("only company can update internship dates");

    if (!db_run(db,
        `UPDATE Internship
         SET min_begin = ?, max_begin = ?, duration = ?
         WHERE company_id = ? AND title = ?;`,
        [req.body.min_begin, req.body.max_begin, req.body.duration,
         req.full_account.id, req.body.title]
    ))
        return res.status(400).send("can't update internship dates");

    res.send();
});


// STUDENT

// POST /api/student/apply
// body: { title: "" }  // internship title
apiRouter.post('/student/apply', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.STUDENT)
        return res.status(401).send("only students can apply");

    const internship = db_get(db,
        `SELECT id FROM Internship WHERE title = ?;`,
        [req.body.title]
    );
    if (internship === null)
        return res.status(404).send("internship not found");

    // prevent double application
    if (db_get(db,
        `SELECT 1 FROM Applications WHERE student_id = ? AND internship_id = ?;`,
        [req.full_account.id, internship.id]
    ) !== null)
        return res.status(409).send("already applied to this internship");

    if (!db_run(db,
        `INSERT INTO Applications (student_id, internship_id, applied_at, status)
         VALUES (?, ?, ?, 'pending');`,
        [req.full_account.id, internship.id, Math.floor(Date.now() / 1000)]
    ))
        return res.status(500).send("failed to apply");

    res.send();
});

// GET /api/student/applications
// -> [{ internship_title, company_name, domain, status, applied_at }]
apiRouter.get('/student/applications', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.STUDENT)
        return res.status(401).send("only students can view their applications");

    let apps = db_get_all(db,
        `SELECT
            inf.id,
            inf.internship_id,
            inf.status,
            i.title AS internship_title,
            d.title AS domain,
            co.name_company AS company_name
         FROM Internship_files inf
         JOIN Internship i ON i.id = inf.internship_id
         LEFT JOIN Domains d ON d.id = i.domain_id
         LEFT JOIN Companies co ON co.id = i.company_id
         WHERE inf.student_id = ?;`,
        [req.full_account.id]
    );
    if (apps === null) apps = [];
    res.send(apps);
});



// POST /api/student/document
// body: { internship_title: "", filename: "", type: "rapport|resume|evaluation|..." }
// (fichier déjà uploadé dans var/storage via une route upload séparée)
apiRouter.post('/student/document', auth, m_full_account, upload.array('files'), (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.STUDENT)
        return res.status(401).send("only students can submit documents");

    const { internship_title, type_id } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0)
        return res.status(400).send("no files uploaded");

    const internship = db_get(db,
        `SELECT id FROM Internship WHERE title = ?;`,
        [internship_title]
    );
    if (internship === null)
        return res.status(404).send("internship not found");

    const application = db_get(db,
        `SELECT id FROM Internship_files
         WHERE student_id = ? AND internship_id = ? AND status = 'accepted';`,
        [req.full_account.id, internship.id]
    );
    if (application === null)
        return res.status(403).send("you are not accepted in this internship");

    try {
        for (const file of files) {
            db.prepare(
                `INSERT INTO Documents (internship_file_id, file_path, type_id, student_accessible)
                 VALUES (?, ?, ?, 1);`
            ).run(application.id, file.path, type_id ?? 1);
        }
    } catch (err: any) {
        return res.status(500).send("failed to register document: " + err.message);
    }

    res.send({ uploaded: files.length });
});


// POST /api/student/request/domain
// body: { domain: "" }  // demande d'ajout d'un domaine inexistant
apiRouter.post('/student/request/domain', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.STUDENT)
        return res.status(401).send("only students can request new domains");

    if (!db_run(db,
        `INSERT INTO Domain_requests (student_id, domain_title, requested_at, status)
         VALUES (?, ?, ?, 'pending');`,
        [req.full_account.id, req.body.domain, Math.floor(Date.now() / 1000)]
    ))
        return res.status(500).send("failed to submit domain request");

    res.send();
});


// SUPERVISOR

// GET /api/supervisor/students
// -> [{ student_id, first_name, last_name, email, internship_title, company, status }]
apiRouter.get('/supervisor/students', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.SUPERVISOR)
        return res.status(403).send("only supervisors can list their students");
 
    let students = db_get_all(db,
        `SELECT
            acc.email,
            p.first_name,
            p.last_name,
            i.title      AS internship_title,
            co.name_company AS company,
            inf.status
         FROM Internship_files inf
         JOIN Accounts acc    ON acc.id = inf.student_id
         LEFT JOIN Persons p  ON p.id   = inf.student_id
         JOIN Internship i    ON i.id   = inf.internship_id
         JOIN Companies co    ON co.id  = i.company_id
         WHERE inf.tutor_id = ?;`,
        [req.full_account.id]
    );
    if (students === null) students = [];
    res.send(students);
});


// PUT /api/supervisor/application/status
// body: { application_id: number, status: "accepted"|"rejected"|"validated" }
apiRouter.put('/supervisor/application/status', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.SUPERVISOR)
        return res.status(401).send("only supervisors can update application status");

    const allowed_statuses = ['accepted', 'rejected', 'validated'];
    if (!allowed_statuses.includes(req.body.status))
        return res.status(400).send("invalid status");

    if (!db_run(db,
        `UPDATE Applications SET status = ? WHERE id = ?;`,
        [req.body.status, req.body.application_id]
    ))
        return res.status(500).send("failed to update status");

    res.send();
});





// ADMIN

// GET /api/admin/accounts
apiRouter.get('/admin/accounts', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.ADMIN)
        return res.status(401).send("only admin can list accounts");

    let accounts = db_get_all(db, `
        SELECT
            a.id,
            a.email,
            p.first_name,
            p.last_name,
            co.name_company,
            co.url_site,
            CASE
                WHEN ad.id IS NOT NULL THEN 0
                WHEN su.id IS NOT NULL THEN 1
                WHEN st.id IS NOT NULL THEN 2
                WHEN co.id IS NOT NULL THEN 3
                ELSE -1
            END AS role
        FROM Accounts a
        LEFT JOIN Persons     p  ON p.id  = a.id
        LEFT JOIN Admins      ad ON ad.id = a.id
        LEFT JOIN Supervisors su ON su.id = a.id
        LEFT JOIN Students    st ON st.id = a.id
        LEFT JOIN Companies   co ON co.id = a.id;
    `, []);
    if (accounts === null) accounts = [];
    res.send(accounts);
});

// POST /api/admin/accounts
apiRouter.post('/admin/accounts', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.ADMIN)
        return res.status(401).send("only admin can create accounts");

    const { email, password, role, first_name, last_name, name_company, url_site } = req.body;

    if (!email || !password || role === undefined || role === null)
        return res.status(400).send("email, password and role are required");

    if (!(Object.values(ROLE) as number[]).includes(Number(role)))
        return res.status(400).send("invalid role");

    if (db_get(db, `SELECT 1 FROM Accounts WHERE email = ?;`, [email]) !== null)
        return res.status(409).send("email already exists");

    const password_hash = createHash('sha256').update(password).digest('hex');

    let account_id: number;
    try {
        const result = db.prepare(
            `INSERT INTO Accounts (email, password_hash) VALUES (?, ?);`
        ).run(email, password_hash);
        account_id = result.lastInsertRowid as number;
    } catch (err) {
        console.error("INSERT Accounts error:", err);
        return res.status(500).send("can't create account");
    }

    try {
        const r = Number(role);
        if (r === ROLE.STUDENT)
            db.prepare(`INSERT INTO Students (id) VALUES (?);`).run(account_id);
        else if (r === ROLE.COMPANY)
            db.prepare(`INSERT INTO Companies (id, name_company, url_site) VALUES (?, ?, ?);`)
              .run(account_id, name_company ?? '', url_site ?? null);
        else if (r === ROLE.SUPERVISOR)
            db.prepare(`INSERT INTO Supervisors (id) VALUES (?);`).run(account_id);
        else if (r === ROLE.ADMIN)
            db.prepare(`INSERT INTO Admins (id) VALUES (?);`).run(account_id);

        if (r !== ROLE.COMPANY)
            db.prepare(`INSERT INTO Persons (id, first_name, last_name) VALUES (?, ?, ?);`)
              .run(account_id, first_name ?? '', last_name ?? '');

    } catch (err: any) {
        console.error("INSERT role table error:", err.message);
        db.prepare(`DELETE FROM Accounts WHERE id = ?;`).run(account_id);
        return res.status(500).send("can't assign role: " + err.message);
    }

    res.status(201).send({ id: account_id });
});

// PUT /api/admin/account/:id
apiRouter.put('/admin/account/:id', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.ADMIN)
        return res.status(401).send("only admin can edit accounts");

    const id = Number(req.params.id);

    if (req.body.email) {
        try {
            db.prepare(`UPDATE Accounts SET email = ? WHERE id = ?;`).run(req.body.email, id);
        } catch (err) {
            return res.status(500).send("can't update email");
        }
    }

    if (req.body.first_name || req.body.last_name) {
        const exists = db_get(db, `SELECT 1 FROM Persons WHERE id = ?;`, [id]);
        if (exists)
            db.prepare(`UPDATE Persons SET first_name = ?, last_name = ? WHERE id = ?;`)
              .run(req.body.first_name ?? '', req.body.last_name ?? '', id);
        else
            db.prepare(`INSERT INTO Persons (id, first_name, last_name) VALUES (?, ?, ?);`)
              .run(id, req.body.first_name ?? '', req.body.last_name ?? '');
    }

    if (req.body.name_company || req.body.url_site) {
        db.prepare(`UPDATE Companies SET name_company = ?, url_site = ? WHERE id = ?;`)
          .run(req.body.name_company ?? '', req.body.url_site ?? null, id);
    }

    res.send();
});

// DELETE /api/admin/account/:id
apiRouter.delete('/admin/account/:id', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.ADMIN)
        return res.status(401).send("only admin can delete accounts");

    const id = Number(req.params.id);

    if (req.full_account.id === id)
        return res.status(400).send("can't delete your own account");

    try {
        db.prepare(`DELETE FROM Tokens     WHERE account_id = ?;`).run(id);
        db.prepare(`DELETE FROM Persons    WHERE id = ?;`).run(id);
        db.prepare(`DELETE FROM Students   WHERE id = ?;`).run(id);
        db.prepare(`DELETE FROM Supervisors WHERE id = ?;`).run(id);
        db.prepare(`DELETE FROM Admins     WHERE id = ?;`).run(id);
        db.prepare(`DELETE FROM Companies  WHERE id = ?;`).run(id);

        const result = db.prepare(`DELETE FROM Accounts WHERE id = ?;`).run(id);
        if (result.changes === 0)
            return res.status(404).send("account not found");
    } catch (err) {
        console.error("DELETE account error:", err);
        return res.status(500).send("can't delete account");
    }

    res.send();
});


// GET /api/company/documents/:internship_file_id
apiRouter.get('/company/documents/:id', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.COMPANY)
        return res.status(401).send("only company can view documents");

    const owns = db_get(db,
        `SELECT 1 FROM Internship_files inf
         JOIN Internship i ON i.id = inf.internship_id
         WHERE inf.id = ? AND i.company_id = ?;`,
        [req.params.id, req.full_account.id]
    );
    if (owns === null)
        return res.status(403).send("not your internship");

    let docs = db_get_all(db,
        `SELECT d.id, d.file_path, dt.info AS type
         FROM Documents d
         JOIN Document_types dt ON dt.id = d.type_id
         WHERE d.internship_file_id = ?;`,
        [req.params.id]
    );
    if (docs === null) docs = [];
    res.send(docs);
});


// GET /api/download/:id
apiRouter.get('/download/:id', auth, m_full_account, (req: any, res: any) =>
{
    const doc = db_get(db,
        `SELECT d.file_path FROM Documents d WHERE d.id = ?;`,
        [req.params.id]
    );
    if (doc === null)
        return res.status(404).send("document not found");

    const file = path.resolve(doc.file_path);
    if (!fs.existsSync(file))
        return res.status(404).send("file not found on disk");

    res.download(file);
});


apiRouter.post('/student/apply/documents', auth, m_full_account, upload.array('files'), (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.STUDENT)
        return res.status(401).send("only students can upload application documents");
 
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0)
        return res.status(400).send("no files uploaded");
 
    const internship_id = Number(req.body.internship_id);
    if (!internship_id)
        return res.status(400).send("internship_id is required");
 
    // Vérifier que la candidature existe (peu importe le statut)
    const application = db_get(db,
        `SELECT id FROM Internship_files
         WHERE student_id = ? AND internship_id = ?;`,
        [req.full_account.id, internship_id]
    );
    if (application === null)
        return res.status(404).send("application not found — apply first");
 
    // Chercher le type "Candidature" ou prendre le premier type disponible
    const candidatureType = db_get(db, `SELECT id FROM Document_types WHERE info LIKE '%andidat%' LIMIT 1;`, []);
    const firstType       = db_get(db, `SELECT id FROM Document_types ORDER BY id ASC LIMIT 1;`, []);
    const type_id         = candidatureType?.id ?? firstType?.id ?? 1;
 
    console.log(`[apply/documents] type_id=${type_id} application.id=${application.id} files=${files.length}`);
 
    try {
        for (const file of files) {
            db.prepare(
                `INSERT INTO Documents (internship_file_id, file_path, type_id, student_accessible)
                 VALUES (?, ?, ?, 1);`
            ).run(application.id, file.path, type_id);
        }
    } catch (err: any) {
        console.error("[apply/documents] INSERT error:", err.message);
        return res.status(500).send("failed to register document: " + err.message);
    }
 
    res.send({ uploaded: files.length });
});


apiRouter.put('/admin/application/tutor', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.ADMIN)
        return res.status(403).send("only admin can assign tutors");
 
    const { internship_file_id, tutor_id } = req.body;
    if (!internship_file_id || !tutor_id)
        return res.status(400).send("internship_file_id and tutor_id are required");
 
    // Vérifier que le tutor est bien un superviseur
    const supervisor = db_get(db, `SELECT id FROM Supervisors WHERE id = ?;`, [tutor_id]);
    if (supervisor === null)
        return res.status(404).send("supervisor not found");
 
    try {
        db.prepare(`UPDATE Internship_files SET tutor_id = ? WHERE id = ?;`)
          .run(tutor_id, internship_file_id);
    } catch (err: any) {
        return res.status(500).send("failed to assign tutor: " + err.message);
    }
 
    res.send();
});
 
