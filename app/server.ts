
// easy get/post/... request
import express from 'express'



let app = express();
const port = 8000;


// get where to find url
import { apiRouter } from './api.ts'
import { authRouter } from './auth.ts';

// activate
app.use('/api', apiRouter);
app.use('/auth', authRouter);


// static directory
// app.use(express.static('public'));
// app.use(express.static('share'));

// start server
app.listen(port, () => { console.log('Server running on http://localhost:' + port) });

