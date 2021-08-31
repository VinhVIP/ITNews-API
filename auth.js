const jwt = require('jsonwebtoken');

const auth = {};

auth.tokenData = (req) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader.split(' ')[1];
    var result = null;

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            result = data;
        }
    })
    return result;
}

auth.authenAdmin = (req, res, next) => {
    const authorizationHeader = req.headers['authorization'];
    // Beaer [token]
    if (!authorizationHeader) return res.sendStatus(401);

    const token = authorizationHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403);
        }
        // console.log(data);
        if (data.id_role != 1) return res.sendStatus(403);
        next();
    })
}

auth.authenGTModer = (req, res, next) => {
    const authorizationHeader = req.headers['authorization'];
    // Beaer [token]
    if (!authorizationHeader) return res.sendStatus(401);

    const token = authorizationHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403);
        }
        if (data.id_role > 2) return res.sendStatus(403);
        else next();
    })
}

auth.authenGTUser = (req, res, next) => {
    const authorizationHeader = req.headers['authorization'];
    // Beaer [token]
    if (!authorizationHeader) return res.sendStatus(401);

    const token = authorizationHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403);
        }
        // console.log(data);
        next();
    })
}

module.exports = auth;