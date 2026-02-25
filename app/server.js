const http = require('http');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fs = require("fs");

// easy get/post/... request
const express = require('express');

// database
const sqlite3 = require('sqlite3');

// unused ?
// const sha256 = require('js-sha256');
// const path = require('path');
// const { fileURLToPath, url } = require('url');


let app = express();
const port = 8000;


// get where to find url
// const { apiRoutes, authRoutes }  = require("./api.js");
const { apiRouter, authRouter } = require("./api.js");


// // activate
app.use("/api", apiRouter);
app.use("/auth", authRoutes);


// static directory
app.use(express.static("public"));
app.use(express.static("share"));

// start server
app.listen(port, () => { console.log("Server running on http://localhost:" + port) });


