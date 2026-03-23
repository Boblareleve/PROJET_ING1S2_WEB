const express = require('express');
const cookieParser = require("cookie-parser");

// download files ?
const path = require('path');


const { is_connected, authRouter } = require('./auth.js');
const router  = express.Router();
// const authRouter = express.Router();
// console.log(router);
// console.log(typeof router);

router.use(express.json());
router.use(cookieParser());

// console.log(router);
// console.log(typeof router);


// add middel ware when connections needed
function auth(req, res, next)
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


router.get('/download/:filename', auth, (req, res) =>
{
    // sanitize to prevent path traversal attacks (../../etc/passwd)
    const filename = path.basename(req.params.filename)
    const file = path.join(__dirname, 'var/storage', '?', filename)

    res.download(file, (err) =>
    {
        if (err) res.status(404).json({ error: 'File ' + filename + ' not found' })
    })
})


module.exports = { apiRouter: router, authRouter };


