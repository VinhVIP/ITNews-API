const pool = require('../../../database');

const db = {};

db.selectAll = () => {
    return new Promise((resolve, reject) => {
        pool.query(`select T.*, 
                (select count(*) from post_tag PT, post P where T.id_tag=PT.id_tag and PT.id_post=P.id_post and P.status=1 and P.access=1) total_post,
                (select count(*) from follow_tag FT where T.id_tag=FT.id_tag) total_follower
                from tag T`, [], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.selectAllByAccount = (id_account) =>{
    return new Promise((resolve, reject) => {
        pool.query(`select T.*, 
                (select count(*) from post_tag PT, post P where T.id_tag=PT.id_tag and PT.id_post=P.id_post and P.status=1 and P.access=1) total_post,
                (select count(*) from follow_tag FT where T.id_tag=FT.id_tag) total_follower,
                (select exists(select * from follow_tag FT where T.id_tag=FT.id_tag and FT.id_account=$1)) as status
                from tag T`, [id_account], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.has = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT name FROM tag WHERE id_tag=$1", [id], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rowCount > 0);
        })
    })
}

db.selectId = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(`select T.*, 
                (select count(*) from post_tag PT, post P where T.id_tag=$1 and T.id_tag=PT.id_tag and PT.id_post=P.id_post and P.status=1 and P.access=1) total_post,
                (select count(*) from follow_tag FT where T.id_tag=$1 and T.id_tag=FT.id_tag) total_follower
                from tag T
                where T.id_tag=$1`, [id], (err, result) => {
            if (err) return reject(err);
            if (result.rowCount > 0) {
                return resolve({ status: true, data: result.rows[0] });
            } else {
                return resolve({ status: false });
            }
        })
    })
}

db.selectIdByAccount = (id_tag, id_account) => {
    return new Promise((resolve, reject) => {
        pool.query(`select T.*, 
                (select count(*) from post_tag PT, post P where T.id_tag=$1 and T.id_tag=PT.id_tag and PT.id_post=P.id_post and P.status=1 and P.access=1) total_post,
                (select count(*) from follow_tag FT where T.id_tag=$1 and T.id_tag=FT.id_tag) total_follower,
                (select exists(select * from follow_tag FT where T.id_tag=$1 and T.id_tag=FT.id_tag and FT.id_account=$2)) as status
                from tag T
                where T.id_tag=$1`, [id_tag, id_account], (err, result) => {
            if (err) return reject(err);
            if (result.rowCount > 0) {
                return resolve({ status: true, data: result.rows[0] });
            } else {
                return resolve({ status: false });
            }
        })
    })
}

db.add = (tag) => {
    return new Promise((resolve, reject) => {
        var query = tag.logo
            ? "INSERT INTO tag (name, logo) VALUES ($1, $2) RETURNING *"
            : "INSERT INTO tag (name) VALUES ($1) RETURNING *";

        var name = tag.name;
        var logo = tag.logo ?? '';

        pool.query(query,
            tag.logo ? [name, logo] : [name],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0])
            })
    })
}

db.update = (id, tag) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE tag set name=$1, logo=$2 WHERE id_tag=$3 RETURNING *",
            [tag.name, tag.logo, id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0])
            })
    })
}

module.exports = db;