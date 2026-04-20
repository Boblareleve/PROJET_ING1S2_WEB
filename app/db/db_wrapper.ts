import sqlite3 from 'better-sqlite3'


// first result
// null on error/not found
// object otherwise
export function db_get(db : sqlite3.Database, sql : string, params : any[]) : any
{
    try
    {
        const res = db.prepare(sql).get(params);
        if (res === undefined)
            return null;
        return res;
    }
    catch (err)
    {
        console.log("get ("+sql+") failed: " + err);
        return null;
    }
}

// !== true on error
export function db_run(db : sqlite3.Database, sql : string, params : any[]) : boolean | null
{
    try {
        db.prepare(sql).run(params);
        return true;
    }
    catch (err) {
        console.log("run ("+sql+") failed: " + err);
        return null;
    }
}


// all result
// null on error/not found
// object otherwise
export function db_get_all(db : sqlite3.Database, sql : string, params : any[]) : any
{
    try
    {
        const res = db.prepare(sql).all(params);
        if (res === undefined)
            return null;
        return res;
    }
    catch (err)
    {
        console.log("get ("+sql+") failed: " + err);
        return null;
    }
}

