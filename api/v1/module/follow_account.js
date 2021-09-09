const pool = require('../../../database');

const db = {};

db.add = (id_account, id_account_follower) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO follow_account (id_follower, id_following) VALUES ($1, $2)",
            [id_account, id_account_follower], (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            })
    })
}

db.has = (id_account, id_account_follower) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM follow_account WHERE id_follower=$1 AND id_following=$2",
            [id_account, id_account_follower], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.delete = (id_account, id_account_follower) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM follow_account WHERE id_follower=$1 AND id_following=$2",
            [id_account, id_account_follower], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

// Những tài khoản mà id_account theo dõi
db.listFollowerOf = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT A.id_account, R.id_role, R.name role_name, A.account_name, A.real_name, A.email, a.avatar, A.birth, A.company, A.phone, A.create_date, A.status
        FROM account A
        INNER JOIN follow_account F ON A.id_account=F.id_follower
        INNER JOIN role R ON R.id_role=A.id_role
        WHERE F.id_following=$1`,
            [id_account], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.listFollowingOfLite = (id_account)=>{
    return new Promise((resolve ,reject)=>{
        pool.query('SELECT id_follower FROM follow_account WHERE id_following = $1',
        [id_account],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows)
        })
    })
}

// Những tài khoản theo dõi id_account
db.listFollowingOf = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT A.id_account, R.id_role, R.name role_name, A.account_name, A.real_name, A.email, a.avatar, A.birth, A.company, A.phone, A.create_date, A.status
        FROM account A
        INNER JOIN follow_account F ON A.id_account=F.id_following
        INNER JOIN role R ON R.id_role=A.id_role
        WHERE F.id_follower=$1`,
            [id_account], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.deleteAll = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM follow_account WHERE id_following=$1", [id_account], (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        })
    })
}

module.exports = db;