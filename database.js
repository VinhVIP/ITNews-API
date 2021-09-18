const { Pool } = require("pg");

// const pool = new Pool({
//     host: 'localhost',
//     database: "itnews",
//     user: "postgres",
//     password: "123456",
//     port: 5432
// });

const pool = new Pool({
    connectionString: 'postgres://mxzqergnwzqsht:51727ab51b53fa6bcb99153e414cfae2174643180c68a5d6e861652dccf8a247@ec2-3-219-111-26.compute-1.amazonaws.com:5432/d5v9kh71bpc9m0',
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.log("Error: " + err);
    process.exit(-1);
})

module.exports = pool;