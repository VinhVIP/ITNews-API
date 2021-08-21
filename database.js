const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: "123456",
    database: "book_db",
    host: "localhost",
    port: 5432
});

module.exports = pool;