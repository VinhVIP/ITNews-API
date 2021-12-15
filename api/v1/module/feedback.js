const pool = require('../../../database');

const db = {};
// db. = ()=>{
//     return new Promise((resolve, reject)=>{
//         pool.query('',
//         [],
//         (err, result)=>{
//             if(err) return reject(err);
//             return resolve(result.rows)
//         })
//     })
// }

db.add = (id_account, subject, content)=>{
    return new Promise((resolve, reject)=>{
        pool.query('INSERT INTO feedback (id_account, subject, content) VALUES ($1, $2, $3) RETURNING id_feedback',
        [id_account, subject, content],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].id_feedback)
        })
    })
}

db.has = (id_feedback)=>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT * FROM feedback WHERE id_feedback = $1',
        [id_feedback],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rowCount>0)
        })
    })
}

db.selectID = (id_feedback)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT f.*, a.email, a.id_account, a.account_name, a.real_name, 
            TO_CHAR(date_time :: time, 'hh24:mi') as time, 
            TO_CHAR(date_time :: date, 'dd/mm/yyyy') as day
            FROM feedback f, account a
            WHERE id_feedback = $1 AND f.id_account = a.id_account`,
        [id_feedback],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0])
        })
    })
}

db.selectAll = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT f.id_feedback, f.subject, f.date_time, f.status, a.id_account, a.account_name, a.email, a.real_name FROM 
                    feedback f, account a
                    WHERE f.id_account = a.id_account
                    ORDER BY f.date_time`,
        [],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows)
        })
    })
}

db.selectAmountAll = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT COUNT(id_feedback) AS amount FROM feedback',
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].amount)
        })
    })
}

db.selectUnread = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT f.id_feedback, f.subject, f.date_time, f.status, a.id_account, a.account_name, a.email, a.real_name FROM 
                    feedback f, account a 
                    WHERE f.status = 0 AND f.id_account = a.id_account
                    ORDER BY f.date_time`,
        [],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows)
        })
    })
}

db.selectAmountUnread = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT COUNT(id_feedback) AS amount 
                    FROM feedback 
                    WHERE status = 0`,
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].amount)
        })
    })
}

db.updateRead = (id_feedback)=>{
    return new Promise((resolve, reject)=>{
        pool.query('UPDATE feedback SET status = 1 WHERE id_feedback = $1',
        [id_feedback],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows)
        })
    })
}

db.updateUnRead = (id_feedback)=>{
    return new Promise((resolve, reject)=>{
        pool.query('UPDATE feedback SET status = 0 WHERE id_feedback = $1',
        [id_feedback],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows)
        })
    })
}

db.delete = (id_feedback)=>{
    return new Promise((resolve, reject)=>{
        pool.query('DELETE FROM feedback WHERE id_feedback = $1',
        [id_feedback],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows)
        })
    })
}

module.exports = db;