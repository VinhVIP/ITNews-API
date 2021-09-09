const pool = require('../../../database');

const db = {};

db.checkAccount = (account) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM account WHERE account_name=$1 AND password=$2",
            [account.account_name, account.password],
            (err, result) => {
                if (err) return reject(err);
                if (result.rows.length > 0) {
                    return resolve({
                        status: true,
                        data: result.rows[0]
                    })
                } else {
                    return resolve({ status: false })
                }
            })
    })
}

db.selectAll = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM account", [], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rows);
        })
    });
}

db.has = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT EXISTS (SELECT account_name FROM account WHERE id_account=$1)",
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].exists)
            })
    })
}

db.selectId = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT A.id_account, A.id_role, R.name role_name, A.real_name, A.email, A.avatar, A.birth, A.company, A.phone, A.create_date, A.status
        FROM account A
        INNER JOIN role R ON A.id_role=R.id_role
        WHERE A.id_account=$1`,
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.selectRole = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(`select CV.id_role, CV.name from 
            account as A join role as CV
            on A.id_role=CV.id_role
            where A.id_account=$1`,
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.selectName = (id_account)=>{
    return new Promise((resolve ,reject)=>{
        pool.query('SELECT real_name FROM account WHERE id_account = $1',
        [id_account],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].real_name);
        })
    })
}

db.add = (account) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO account (account_name, real_name, email, password, id_role) VALUES ($1,$2,$3,$4,$5) RETURNING id_account",
            [account.account_name, account.real_name, account.email, account.password, account.id_role],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_account);
            });
    });
}

db.update = (id, account) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE account SET real_name=$1, birth=$2, gender=$3, company=$4, phone=$5, avatar=$6 WHERE id_account=$7 RETURNING *",
            [account.real_name, account.birth, account.gender, account.company, account.phone, account.avatar, id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    })
}

db.updateRole = (id, id_chucvu) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE account SET id_role=$1 WHERE id_account=$2 RETURNING *",
            [id_chucvu, id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.updateStatus = (id, status) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE account SET status=$1 WHERE id_account=$2 RETURNING *",
            [status, id],
            (err, result) => {
                if (err) return reject(err);
                console.log(result.rows[0]);
                return resolve(result.rows[0]);
            })
    })
}


module.exports = db;