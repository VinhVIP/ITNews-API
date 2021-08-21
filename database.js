const Pool = require("pg").Pool;

const pool = new Pool({
    host: 'ec2-35-153-114-74.compute-1.amazonaws.com',
    database: "dt434phd71r4",
    user: "pidtkoivbjludp",
    password: "e0bce354b6922538b3e37c7d351d41f150b9a39d34a70b47e26bcdaeea4a1abf",
    port: 5432
});

module.exports = pool;