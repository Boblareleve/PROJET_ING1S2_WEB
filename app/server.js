// const http = require('http');
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
// const fs = require("fs");

// easy get/post/... request
const express = require('express');



let app = express();
const port = 8000;


// get where to find url
const { apiRouter, authRouter } = require('./api.ts');

// activate
app.use('/api', apiRouter);
app.use('/auth', authRouter);


// static directory
app.use(express.static('public'));
app.use(express.static('share'));

// start server
app.listen(port, () => { console.log('Server running on http://localhost:' + port) });



