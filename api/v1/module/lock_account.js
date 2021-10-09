const pool = require('../../../database');

const db = {};

db.add = (id_account_lock, id_account_boss, reason, hours_lock)=>{
    return new Promise((resolve ,reject)=>{
        pool.query(`INSERT INTO lock_account(id_account_lock, id_account_boss, 
            reason, hours_lock, time_end_lock) 
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP + interval '${hours_lock}' hour)`,
        [id_account_lock, id_account_boss, reason, hours_lock],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0])
        })
    })
}

db.check = (id_account)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT time_end_lock <= CURRENT_TIMESTAMP AS valid 
            FROM lock_account 
            WHERE id_account_lock = $1 
            ORDER BY time_end_lock DESC LIMIT 1`,
        [id_account],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].valid);
        })
    })
}

db.selectAll = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query(`WITH lock_boss AS(
                SELECT l.*, a.real_name AS boss_name, 
                a.account_name AS boss_account 
                FROM lock_account l, account a 
                WHERE l.id_account_boss = a.id_account)
            SELECT l.*, a.real_name AS locker_name, 
            a.account_name AS locker_account,
            TO_CHAR(l.time_start_lock :: date, 'dd/mm/yyyy') AS day_start,
            TO_CHAR(l.time_start_lock :: time, 'hh24:mi') AS time_start,
            TO_CHAR(l.time_end_lock :: date, 'dd/mm/yyyy') AS day_end,
            TO_CHAR(l.time_end_lock :: time, 'hh24:mi') AS time_end
            FROM lock_boss l, account a
            WHERE l.id_account_lock = a.id_account`,
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows);
        })
    })
}

module.exports = db;