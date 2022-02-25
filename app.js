const express = require('express');
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');

const app = express();
const dotenv = require('dotenv');
const db = require('./database');

// const drive = require('./drive');

// Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use(fileUpload());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

dotenv.config();

app.use(express.json());

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// for parsing multipart/form-data
// app.use(upload.array());
app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


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


// ----- My API V1
const apiUrl = '/api/v1';


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

// Follow Tag
app.use(`${apiUrl}/follow_tag`, require('./api/v1/routers/follow_tag'));

// Follow Account
app.use(`${apiUrl}/follow_account`, require('./api/v1/routers/follow_account'));

// Comment
app.use(`${apiUrl}/post`, require('./api/v1/routers/comment'));

// update image
app.use(`${apiUrl}/image`, require('./api/v1/routers/image'));

// notification
app.use(`${apiUrl}/notification`, require('./api/v1/routers/notification'));

// information
app.use(`${apiUrl}/information`, require('./api/v1/routers/information'));

//feedback
app.use(`${apiUrl}/feedback`, require('./api/v1/routers/feedback'));



// ----- My API V2
const apiUrl2 = '/api/v2';


// Upload file
// app.use('/img', require('./api/v0/routers/file'));


// Account
app.use(`${apiUrl2}/account`, require('./api/v2/routers/account'));

// Role
app.use(`${apiUrl2}/role`, require('./api/v2/routers/role'));

// Tag
app.use(`${apiUrl2}/tag`, require('./api/v2/routers/tag'));

// Post
app.use(`${apiUrl2}/post`, require('./api/v2/routers/post'));

// Vote
app.use(`${apiUrl2}/vote`, require('./api/v2/routers/vote'));

// Bookmark
app.use(`${apiUrl2}/bookmark`, require('./api/v2/routers/bookmark'));

// Follow Tag
app.use(`${apiUrl2}/follow_tag`, require('./api/v2/routers/follow_tag'));

// Follow Account
app.use(`${apiUrl2}/follow_account`, require('./api/v2/routers/follow_account'));

// Comment
app.use(`${apiUrl2}/post`, require('./api/v2/routers/comment'));

// update image
app.use(`${apiUrl2}/image`, require('./api/v2/routers/image'));

// notification
app.use(`${apiUrl2}/notification`, require('./api/v2/routers/notification'));

// information
app.use(`${apiUrl2}/information`, require('./api/v2/routers/information'));

//feedback
app.use(`${apiUrl2}/feedback`, require('./api/v2/routers/feedback'));


module.exports = app;