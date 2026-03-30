// const http = require('http');
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
// const fs = require("fs");

// easy get/post/... request
import express from 'express'



let app = express();
const port = 8000;


// get where to find url
import { apiRouter, authRouter } from './api.ts'

// activate
app.use('/api', apiRouter);
app.use('/auth', authRouter);


// static directory
// app.use(express.static('public'));
// app.use(express.static('share'));

// start server
app.listen(port, () => { console.log('Server running on http://localhost:' + port) });



