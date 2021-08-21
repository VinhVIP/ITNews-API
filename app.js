const express = require('express');
const app = express();
const bodyParser = require('body-parser');

var bookRouter = require('./api/routers/book');

// use the express-static middleware
app.use(express.static("public"))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
})

app.use('/book', bookRouter);

app.use('/test', (req, res) => {
    return res.json({
        message: 'test oke'
    });
})



app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        message: error
    })
})

module.exports = app;