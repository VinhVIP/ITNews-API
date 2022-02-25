const pool = require('../../../database');

const db = {};

db.add = (id_account, id_post) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO bookmark (id_account, id_post) VALUES ($1, $2)",
            [id_account, id_post], (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            })
    })
}

db.has = (id_account, id_post) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM bookmark WHERE id_account=$1 AND id_post=$2",
            [id_account, id_post], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.delete = (id_account, id_post) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM bookmark WHERE id_account=$1 AND id_post=$2",
            [id_account, id_post], (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            })
    })
}

db.list = (id_account, page = 0) => {
    if (page === 0) {
        return new Promise((resolve, reject) => {
            pool.query(`SELECT P.*
            FROM post P
            INNER JOIN bookmark B
            ON P.id_post=B.id_post
            WHERE B.id_account=$1 order by B.bookmark_time desc`,
                [id_account], (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        })
    } else {
        return new Promise((resolve, reject) => {
            pool.query(`SELECT P.*
            FROM post P
            INNER JOIN bookmark B
            ON P.id_post=B.id_post
            WHERE B.id_account=$1 order by B.bookmark_time desc LIMIT 10 OFFSET $2`,
                [id_account, (page - 1) * 10], (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        })
    }

}

module.exports = db;