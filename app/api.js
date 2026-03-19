const express = require('express');
const cookieParser = require("cookie-parser");

const router  = express.Router();
// const authRouter = express.Router();
// console.log(router);
// console.log(typeof router);

router.use(express.json());
router.use(cookieParser());

// console.log(router);
// console.log(typeof router);


app.get('/download/:filename', (req, res) =>
{
    // sanitize to prevent path traversal attacks (../../etc/passwd)
    const filename = path.basename(req.params.filename)
    const file = path.join(__dirname, 'var/storage', '?', filename)

    res.download(file, (err) => {
        if (err) res.status(404).json({ error: 'File ' + filename + ' not found' })
    })
})




const authRouter = require('./auth.js');
module.exports = { apiRouter: router, authRouter };


