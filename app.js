const express = require('express');
const app = express();
const dotenv = require('dotenv');

dotenv.config();

const apiUrl = '/api/v1';

app.use(express.json());

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// for parsing multipart/form-data
// app.use(upload.array());
app.use(express.static('public'));


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// app.use((req, res, next) => {
//     const error = new Error('Not found');
//     error.status = 404;
//     next(error);
// });

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        message: error
    })
});


// My API

// Upload file
// app.use('/img', require('./api/v0/routers/file'));


// Account
app.use(`${apiUrl}/account`, require('./api/v1/routers/account'));

// Role
app.use(`${apiUrl}/role`, require('./api/v1/routers/role'));

// Tag
app.use(`${apiUrl}/tag`, require('./api/v1/routers/tag'));

// Post
app.use(`${apiUrl}/post`, require('./api/v1/routers/post'));

// Vote
app.use(`${apiUrl}/vote`, require('./api/v1/routers/vote'));

// Bookmark
app.use(`${apiUrl}/bookmark`, require('./api/v1/routers/bookmark'));

module.exports = app;