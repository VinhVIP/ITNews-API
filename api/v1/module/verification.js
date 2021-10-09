const pool = require('../../../database');

const db = {};

db.add = (id_account, code)=>{
    return new Promise((resolve, reject)=>{
        pool.query('INSERT INTO verification(id_account, code) VALUES ($1, $2) returning id_verification',
        [id_account, code],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].id_verification);
        })
    })
}

db.selectCode = (id_account)=>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT code FROM verification WHERE id_account = $1 ORDER BY create_time DESC LIMIT 1',
        [id_account],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].code);
        })
    })
}

db.delete = (id_verification)=>{
    return new Promise((resolve, reject)=>{
        pool.query('DELETE FROM verification WHERE id_verification = $1',
        [id_verification],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(1);
        })
    })
}

db.has = (id_account)=>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT * FROM verification WHERE id_account = $1',
        [id_account],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rowCount>0);
        })
    })
}
module.exports = db;