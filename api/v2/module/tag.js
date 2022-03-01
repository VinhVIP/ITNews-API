const pool = require('../../../database');

const db = {};

db.selectAll = () => {
    return new Promise((resolve, reject) => {
        pool.query(`select T.*, 
                (select count(*) from post_tag PT, post P where T.id_tag=PT.id_tag and PT.id_post=P.id_post and P.status=1 and P.access=1) total_post,
                (select count(*) from follow_tag FT where T.id_tag=FT.id_tag) total_follower,
                false as status
                from tag T order by T.id_tag`, [], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.selectAllByAccount = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query(`select T.*, 
                (select count(*) from post_tag PT, post P where T.id_tag=PT.id_tag and PT.id_post=P.id_post and P.status=1 and P.access=1) total_post,
                (select count(*) from follow_tag FT where T.id_tag=FT.id_tag) total_follower,
                (select exists(select * from follow_tag FT where T.id_tag=FT.id_tag and FT.id_account=$1)) as status
                from tag T order by T.id_tag`, [id_account], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.getSearch = (search, page = 0) => {
    if (page === 0) {
        return new Promise((resolve, reject) => {
            pool.query(`select id_tag
                from tag
                where lower(name) like $1`,
                ['%' + search + '%'],
                (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        });
    } else {
        return new Promise((resolve, reject) => {
            pool.query(`select id_tag
            from tag
            where lower(name) like $1 LIMIT 10 OFFSET $2`,
                ['%' + search + '%', (page - 1) * 10],
                (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows);
                })
        });
    }

}

db.has = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT name FROM tag WHERE id_tag=$1", [id], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rowCount > 0);
        })
    })
}

db.hasName = (name) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM tag WHERE name=$1", [name], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rowCount > 0);
        })
    })
}

db.selectId = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(`select T.*, 
                (select count(*) from post_tag PT, post P where T.id_tag=$1 and T.id_tag=PT.id_tag and PT.id_post=P.id_post and P.status=1 and P.access=1) total_post,
                (select count(*) from follow_tag FT where T.id_tag=$1 and T.id_tag=FT.id_tag) total_follower,
                false as status
                from tag T
                where T.id_tag=$1`, [id], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rows[0]);
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
            return resolve(result.rows[0]);
        })
    })
}

db.add = (name, logo) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO tag (name, logo) VALUES ($1, $2) RETURNING *",
            [name, logo],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0])
            })
    })
}

db.update = (id, name, logo = '') => {
    return new Promise((resolve, reject) => {
        if (logo === '') {
            pool.query("UPDATE tag set name=$1 WHERE id_tag=$2 RETURNING *",
                [name, id],
                (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows[0])
                })
        } else {
            pool.query("UPDATE tag set name=$1, logo=$2 WHERE id_tag=$3 RETURNING *",
                [name, logo, id],
                (err, result) => {
                    if (err) return reject(err);
                    return resolve(result.rows[0])
                })
        }

    })
}

db.delete = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM tag WHERE id_tag=$1",
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0])
            })
    })
}

db.countPostsOfTag = (id_tag) => {
    return new Promise((resolve, reject) => {
        pool.query("select * from post_tag where id_tag=$1",
            [id_tag],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount)
            })
    })
}

db.selectLogo = (id_tag) => {
    return new Promise((resolve, reject) => {
        pool.query("select logo from tag where id_tag=$1",
            [id_tag],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0])
            })
    })
}

module.exports = db;