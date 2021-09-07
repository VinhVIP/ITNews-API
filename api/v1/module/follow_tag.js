const pool = require('../../../database');

const db = {};

db.add = (id_account, id_tag) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO follow_tag (id_account, id_tag) VALUES ($1, $2)",
            [id_account, id_tag], (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            })
    })
}

db.has = (id_account, id_tag) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM follow_tag WHERE id_account=$1 AND id_tag=$2",
            [id_account, id_tag], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.delete = (id_account, id_tag) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM follow_tag WHERE id_account=$1 AND id_tag=$2",
            [id_account, id_tag], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.list = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT T.*
        FROM tag T 
        INNER JOIN follow_tag F 
        ON T.id_tag=F.id_tag
        WHERE F.id_account=$1`,
            [id_account], (err, result) => {
                if (err) return reject(err);
                console.log(result);
                return resolve(result.rows);
            })
    })
}

db.deleteAll = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM follow_tag WHERE id_account=$1", [id_account], (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        })
    })
}

module.exports = db;