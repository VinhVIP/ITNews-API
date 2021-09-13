const pool = require('../../../database');

const db = {};

db.addNotification = (id_account, content, link)=>{
    return new Promise((resolve, reject)=>{
        pool.query('INSERT INTO notification (id_account, content, link) VALUES ($1, $2, $3) returning id_notification',
        [id_account, content, link],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].id_notificatioin);
        });
    });
}

db.deleteNotification = (id_notification)=>{
    return new Promise((resolve, reject)=>{
        pool.query('DELETE FROM notification WHERE id_notification = $1',
        [id_notification],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0]);
        });
    });
}

db.has = (id_notificatioin)=>{
    return new Promise((resolve ,reject)=>{
        pool.query('SELECT id_notification FROM notification WHERE id_notification = $1',
        [id_notificatioin],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rowCount>0)
        })
    })
}

db.readNotification = (id_notificatioin)=>{
    return new Promise((resolve ,reject)=>{
        pool.query('UPDATE notification SET status = 1 WHERE id_notification = $1',
        [id_notificatioin],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0])
        })
    })
}

db.selectUrl = (id_notificatioin)=>{
    return new Promise((resolve ,reject)=>{
        pool.query('SELECT link FROM notification WHERE id_notification = $1',
        [id_notificatioin],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].link)
        })
    })
}

db.selectAccount = (id_notificatioin)=>{
    return new Promise((resolve ,reject)=>{
        pool.query('SELECT id_account FROM notification WHERE id_notification = $1',
        [id_notificatioin],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].id_account)
        });
    });
}

db.listNotification = (id_account, page)=>{
    return new Promise((resolve ,reject)=>{
        pool.query(`SELECT id_notification, content, status 
                    FROM notification 
                    WHERE id_account = $1
                    ORDER BY id_notification
                    LIMIT 10 OFFSET $2`,
        [id_account, (page-1)*10],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows)
        })
    })
}

db.amount = (id_account)=>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT id_notification FROM notification WHERE id_account = $1',
        [id_account],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rowCount)
        })
    })
}

module.exports = db;