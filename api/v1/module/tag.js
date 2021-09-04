const pool = require('../../../database');

const db = {};

db.selectAll = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM tag", [], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.has = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT name FROM tag WHERE id_tag=$1", [id], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rowCount > 0);
        })
    })
}

db.selectId = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM tag WHERE id_tag=$1", [id], (err, result) => {
            if (err) return reject(err);
            console.log(result.rows);
            if (result.rowCount > 0) {
                return resolve({ status: true, data: result.rows[0] });
            } else {
                return resolve({ status: false });
            }
        })
    })
}

db.add = (tag) => {
    return new Promise((resolve, reject) => {
        var query = tag.logo
            ? "INSERT INTO tag (name, logo) VALUES ($1, $2) RETURNING *"
            : "INSERT INTO tag (name) VALUES ($1) RETURNING *";

        var name = tag.name;
        var logo = tag.logo ?? '';

        pool.query(query,
            tag.logo ? [name, logo] : [name],
            (err, result) => {
                if (err) return reject(err);
                console.log(result.rows);
                return resolve(result.rows[0])
            })
    })
}

db.update = (id, tag) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE tag set name=$1, logo=$2 WHERE id_tag=$3 RETURNING *",
            [tag.name, tag.logo, id],
            (err, result) => {
                if (err) return reject(err);
                console.log(result.rows);
                return resolve(result.rows[0])
            })
    })
}

module.exports = db;