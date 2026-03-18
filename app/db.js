
// first result
// null on error/not found
// object otherwise
function db_get(db, sql, params)
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
function db_run(db, sql, params)
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
function db_get_all(db, sql, params)
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


module.exports = { db_get, db_get_all, db_run };
