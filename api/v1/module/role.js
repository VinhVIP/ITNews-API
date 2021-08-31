const pool = require('../../../database');

const db = {};


db.selectAll = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM role", [], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.has = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT EXISTS (SELECT * FROM role WHERE id_role=$1)", [id], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rows[0].exists);
        })
    })

}

db.selectId = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM role WHERE id_role=$1", [id], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rows[0]);
        })
    })
}

module.exports = db;