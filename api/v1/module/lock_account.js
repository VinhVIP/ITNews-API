const pool = require('../../../database');

const db = {};

db.add = (id_account_lock, id_account_boss, reason, hours_lock)=>{
    return new Promise((resolve ,reject)=>{
        pool.query('INSERT INTO lock_account(id_account_lock, id_account_boss, reason, hours_lock) VALUES ($1, $2, $3, $4)',
        [id_account_lock, id_account_boss, reason, hours_lock],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0])
        })
    })
}

db.selectAll = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT * FROM lock_account',
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows);
        })
    })
}

module.exports = db;