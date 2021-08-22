const { Pool } = require("pg");

// const pool = new Pool({
// host: 'ec2-35-153-114-74.compute-1.amazonaws.com',
// database: "dt434phd71r4",
// user: "pidtkoivbjludp",
// password: "e0bce354b6922538b3e37c7d351d41f150b9a39d34a70b47e26bcdaeea4a1abf",
// port: 5432
// });

// const { Pool } = require('postgres-pool');

const pool = new Pool({
    connectionString: 'postgres://pidtkoivbjludp:e0bce354b6922538b3e37c7d351d41f150b9a39d34a70b47e26bcdaeea4a1abf@ec2-35-153-114-74.compute-1.amazonaws.com:5432/dt434phd71r4',
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.log("Error: " + err);
    process.exit(-1);
})

pool.query("SELECT * from book", [], (err, res) => {
    if (err) console.log(err);
    else console.log(res.rows);
})

module.exports = pool;