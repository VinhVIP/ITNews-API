const pool = require('../../../database');

const db = {};

db.selectAll = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM book', '', (err, results) => {
            if (err) return reject(err);
            return resolve(results.rows);
        })
    })
}

db.selectID = (ID) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM book WHERE id = $1", [ID], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rows[0]);
        })
    })
}

db.has = (ID) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT COUNT(*) FROM book WHERE id=$1", [ID], (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        })
    })
}

db.add = (book) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO book (id, name, author, type) VALUES ($1,$2,$3,$4)", [book.id, book.name, book.author, book.type], (err, result) => {
            if (err) return reject(err);
            console.log(result);
            return resolve(result.rows[0]);
        });
    });
}

db.remove = (ID) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM book WHERE id=$1", [ID], (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
}

db.update = (ID, book) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE book SET name=$1, author=$2, type=$3 WHERE id=$4", [book.name, book.author, book.type, ID], (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
}

db.find = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM book WHERE name LIKE $1", [`%${keyword}%`], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rows);
        });
    });
}


module.exports = db;