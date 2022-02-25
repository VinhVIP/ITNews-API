const pool = require('../../../database');

const db = {};

db.add = (id_account, code, minutes)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`INSERT INTO verification(id_account, code, end_time) 
            VALUES ($1, $2, CURRENT_TIMESTAMP + interval '${minutes}' minute) 
            returning id_verification`,
        [id_account, code],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].id_verification);
        })
    })
}

db.check = (id_account)=>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT end_time >= CURRENT_TIMESTAMP AS valid FROM verification WHERE id_account = $1 ORDER BY create_time DESC LIMIT 1',
        [id_account],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].valid);
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

db.deleteByAccount = (id_account)=>{
    return new Promise((resolve, reject)=>{
        pool.query('DELETE FROM verification WHERE id_account = $1',
        [id_account],
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