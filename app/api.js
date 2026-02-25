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

const authRouter = require('./auth.js');
module.exports = { apiRouter: router, authRouter };


