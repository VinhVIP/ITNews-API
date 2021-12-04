const pool = require('../../../database');

const db = {};

db.add = (id_account, vote) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO vote (id_account, id_post, type) VALUES ($1, $2, $3)",
            [id_account, vote.id_post, vote.type],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            })
    })
}

db.has = (id_account, id_post) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT type FROM vote WHERE id_account=$1 AND id_post=$2",
            [id_account, id_post], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.getVoteType = (id_account, id_post) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT type FROM vote WHERE id_account=$1 AND id_post=$2",
            [id_account, id_post],
            (err, result) => {
                if (err) return reject(err);

                if (result.rowCount > 0) {
                    console.log(result.rows);
                    return resolve({
                        status: true,
                        vote: result.rows[0]
                    });
                } else {
                    return resolve({ status: false });
                }
            })
    })
}

db.delete = (id_account, id_post) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM vote WHERE id_account=$1 AND id_post=$2",
            [id_account, id_post],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            })
    })
}

db.update = (id_account, id_post, type) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE vote SET type=$1 WHERE id_account=$2 AND id_post=$3",
            [type, id_account, id_post],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            })
    })
}

db.getUpVotes = (id_post) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM vote WHERE id_post=$1 AND type=1",
            [id_post], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getDownVotes = (id_post) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM vote WHERE id_post=$1 AND type=0",
            [id_post], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getTotalVoteUp = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT COUNT(*) FROM vote WHERE id_account=$1 AND type=1",
            [id_account], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].count);
            })
    })
}

db.getTotalVoteDown = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT COUNT(*) FROM vote WHERE id_account=$1 AND type=0",
            [id_account], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].count);
            })
    })
}

module.exports = db;