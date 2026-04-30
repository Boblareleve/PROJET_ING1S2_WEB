// file: api.ts

import express from 'express'
import cookieParser from 'cookie-parser'
import type { Account } from '../share/role.ts'
import { ROLE } from '../share/role.ts'
import { createHash } from 'crypto'

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


apiRouter.post('/student/apply', auth, (req: any, res: any) =>
{
    
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
        `SELECT a.student_id, a.applied_at, acc.email,
                p.first_name, p.last_name
         FROM Applications a
         JOIN Accounts acc ON acc.id = a.student_id
         LEFT JOIN Persons p ON p.account_id = a.student_id
         WHERE a.internship_id = ?;`,
        [internship.id]
    );
    if (applicants === null)
        applicants = [];

    res.send(applicants);
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
        `SELECT a.status, a.applied_at,
                i.title AS internship_title,
                d.title AS domain,
                c.name  AS company_name
         FROM Applications a
         JOIN Internship i    ON i.id = a.internship_id
         JOIN Domains d       ON d.id = i.domain_id
         JOIN Companies c     ON c.id = i.company_id
         WHERE a.student_id = ?
         ORDER BY a.applied_at DESC;`,
        [req.full_account.id]
    );
    if (apps === null)
        apps = [];

    res.send(apps);
});

// POST /api/student/document
// body: { internship_title: "", filename: "", type: "rapport|resume|evaluation|..." }
// (fichier déjà uploadé dans var/storage via une route upload séparée)
apiRouter.post('/student/document', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.STUDENT)
        return res.status(401).send("only students can submit documents");

    const internship = db_get(db,
        `SELECT id FROM Internship WHERE title = ?;`,
        [req.body.internship_title]
    );
    if (internship === null)
        return res.status(404).send("internship not found");

    // check student is actually linked to this internship
    const application = db_get(db,
        `SELECT id FROM Applications
         WHERE student_id = ? AND internship_id = ? AND status = 'accepted';`,
        [req.full_account.id, internship.id]
    );
    if (application === null)
        return res.status(403).send("you are not accepted in this internship");

    if (!db_run(db,
        `INSERT INTO Internship_files (application_id, filename, type, uploaded_at)
         VALUES (?, ?, ?, ?);`,
        [application.id, req.body.filename, req.body.type,
         Math.floor(Date.now() / 1000)]
    ))
        return res.status(500).send("failed to register document");

    res.send();
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
        `SELECT acc.email,
                p.first_name, p.last_name,
                i.title AS internship_title,
                c.name  AS company,
                a.status
         FROM Supervisions sv
         JOIN Applications a  ON a.id  = sv.application_id
         JOIN Accounts acc    ON acc.id = a.student_id
         LEFT JOIN Persons p  ON p.account_id = a.student_id
         JOIN Internship i    ON i.id  = a.internship_id
         JOIN Companies c     ON c.id  = i.company_id
         WHERE sv.supervisor_id = ?;`,
        [req.full_account.id]
    );
    if (students === null)
        students = [];

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
// -> [{ id, email, role }]
apiRouter.get('/admin/accounts', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.ADMIN)
        return res.status(401).send("only admin can list accounts");

    let accounts = db_get_all(db,
        `SELECT id, email, role FROM Accounts;`,
        []
    );
    if (accounts === null)
        accounts = [];

    res.send(accounts);
});


// POST /api/admin/accounts
// { email, password, role, first_name?, last_name?, name_company?, url_site? }
apiRouter.post('/admin/accounts', auth, m_full_account, (req: any, res: any) =>
{
    if (req.full_account.role !== ROLE.ADMIN)
        return res.status(401).send("only admin can create accounts");

    if (req.body.email    === undefined 
     || req.body.password === undefined
     || req.body.role     === undefined)
        return res.status(401).send("missing field in request");
    
    if ((req.body.role === ROLE.SUPERVISOR || req.body.role === ROLE.STUDENT)
     && (req.body.first_name === undefined || req.body.last_name  === undefined))
        return res.status(401).send("missing field in request for a person");
    
    else if (req.body.role === ROLE.COMPANY 
          && (req.body.name_company === undefined || req.body.url_site === undefined))
        return res.status(401).send("missing field in request for a company");
    

    // check email not already taken
    if (db_get(db, `SELECT 1 FROM Accounts WHERE email = ?;`, [req.body.email]) !== null)
        return res.status(409).send("email '" + req.body.email + "' already exists");

    const password_hash = createHash('sha256').update(req.body.password).digest('hex');

    if (!db_run(db, `
        INSERT INTO Accounts (email, password_hash)
        VALUES (?, ?);`,
        [req.body.email, password_hash]
    ))
        return res.status(500).send("couldn't create account");

    const account = db_get(db, `SELECT id FROM Accounts WHERE email = ?;`, [req.body.email]);
    if (account === null)
        return res.status(500).send("account created but couldn't retrieve id");

    switch (req.body.role)
    {
        case ROLE.ADMIN:
            if (!db_run(db, `INSERT INTO Admins (id) VALUES (?);`, [account.id]))
                return res.status(500).send("couldn't assign admin role");
            break;

        case ROLE.SUPERVISOR:

            if (!db_run(db, `INSERT INTO Supervisors (id) VALUES (?);`, [account.id]))
                return res.status(500).send("couldn't assign supervisor role");
            if (!db_run(db, `INSERT INTO Persons (id, first_name, last_name) VALUES (?, ?, ?);`,
                [account.id, req.body.first_name, req.body.last_name]
            ))
                return res.status(500).send("couldn't create person info");
            break;

        case ROLE.STUDENT:
            if (!db_run(db, `INSERT INTO Students (id) VALUES (?);`, [account.id]))
                return res.status(500).send("couldn't assign student role");
            if (!db_run(db, `INSERT INTO Persons (id, first_name, last_name) VALUES (?, ?, ?);`,
                [account.id, req.body.first_name, req.body.last_name]
            ))
                return res.status(500).send("couldn't create person info");
            break;

        case ROLE.COMPANY:
            if (!req.body.name_company)
                return res.status(400).send("name_company is required for company accounts");
            if (!db_run(db, `INSERT INTO Companies (id, name_company, url_site) VALUES (?, ?, ?);`,
                [account.id, req.body.name_company, req.body.url_site ?? null]
            ))
                return res.status(500).send("couldn't assign company role");
            break;

        default:
            db_run(db, `DELETE FROM Accounts WHERE id = ?;`, [account.id]);
            return res.status(400).send("unrecognized role: " + req.body.role);
    }

    res.send(); //{ email: req.body.email, role: req.body.role });
});


// DELETE /api/admin/accounts
// { email } -> null


