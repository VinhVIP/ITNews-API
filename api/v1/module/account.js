const pool = require('../../../database');

const db = {};

db.selectPasswordByUsername = (user) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT password FROM account WHERE account_name = $1',
            [user],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].password);
            })
    })
}

db.selectByUsername = (account_name) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM account WHERE account_name = $1',
            [account_name],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.hasByUsername = (account_name) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM account WHERE account_name = $1",
            [account_name],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.selectAll = () => {
    return new Promise((resolve, reject) => {
        pool.query(`select a.id_account, a.real_name, a.account_name, a.email, a.avatar, a.birth, a.gender, a.company, a.phone, a.status, r.name as role, 
        (select count(*) from follow_account fa where fa.id_follower=a.id_account) as num_followers, 
        (select count(*) from post p where p.id_account = a.id_account) as num_posts,
        (select count(*) from vote v inner join post p on p.id_post=v.id_post where p.id_account=a.id_account and v.type=1) as reputation,
        false as status
    from account a join role r on r.id_role=a.id_role
    order by a.id_account asc`,
            [],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    });
}

db.selectAllByAccount = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query(`select a.id_account, a.real_name, a.account_name, a.email, a.avatar, a.birth, a.gender, a.company, a.phone, a.status, r.name as role, 
                (select count(*) from follow_account fa where fa.id_follower=a.id_account) as num_followers, 
                (select count(*) from post p where p.id_account = a.id_account) as num_posts,
                (select count(*) from vote v inner join post p on p.id_post=v.id_post where p.id_account=a.id_account and v.type=1) as reputation,
                (select count(*) > 0 from follow_account fa where fa.id_follower=a.id_account and fa.id_following = $1) as status
            from account a join role r on r.id_role=a.id_role
            order by a.id_account asc`,
            [id_account],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    });
}

db.selectAvatar = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT avatar FROM account WHERE id_account = $1`,
            [id_account],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].avatar);
            })
    });
}

db.updateVerification = (id, verification) => {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE account SET verification = $1 WHERE id_account = $2',
            [verification, id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount);
            })
    })
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
        pool.query(`SELECT A.id_account, A.id_role, 
            R.name role_name, A.real_name, A.email, 
            A.avatar, A.company, A.phone, A.status,
            TO_CHAR(A.birth:: date, 'dd/mm/yyyy') AS birth,
            TO_CHAR(A.create_date:: date, 'dd/mm/yyyy') AS create_date
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

db.selectIdStatus = (idAccount, idUser) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT A.id_account, A.id_role, 
        R.name role_name, A.real_name, A.email, 
        A.avatar, A.company, A.phone, A.status,
        TO_CHAR(A.birth:: date, 'dd/mm/yyyy') AS birth,
        TO_CHAR(A.create_date:: date, 'dd/mm/yyyy') AS create_date,
        (select exists(select * from follow_account where id_follower=$1 and id_following=$2)) as status
        FROM account A
        INNER JOIN role R ON A.id_role=R.id_role
        WHERE A.id_account=$2`,
            [idAccount, idUser],
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

db.selectName = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT real_name FROM account WHERE id_account = $1',
            [id_account],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].real_name);
            })
    })
}

db.add = (account) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO account (account_name, real_name, email, password, id_role, avatar) VALUES ($1,$2,$3,$4,$5, $6) RETURNING id_account",
            [account.account_name, account.real_name, account.email, account.password, account.id_role, account.avatar],
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

db.updateAvatar = (id, avatar) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE account SET avatar=$1 WHERE id_account=$2 ",
            [avatar, id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.updateAvatarDefault = (old_image, new_image) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE account SET avatar=$1 WHERE avatar=$2 ",
            [new_image, old_image],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
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
                return resolve(result.rows[0]);
            })
    })
}

db.updatePassword = (id, password) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE account SET password=$1 WHERE id_account=$2",
            [password, id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.countAdmin = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT id_account FROM account WHERE id_role = 1',
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount);
            });
    })
}

module.exports = db;