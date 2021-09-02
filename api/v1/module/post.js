const pool = require('../../../database');

const db = {};

db.selectId = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM post WHERE id_post=$1",
            [id],
            (err, result) => {
                if (err) return reject(err);

                if (result.rowCount > 0) {
                    pool.query(`select T.id_tag, T.name, T.logo 
                    from tag T
                    inner join post_tag PT on T.id_tag = PT.id_tag
                    where PT.id_post=$1`,
                        [result.rows[0].id_post],
                        (err2, res2) => {
                            if (err2) return reject(err2);

                            return resolve({
                                status: true,
                                data: {
                                    post: result.rows[0],
                                    tags: res2.rows
                                }
                            })
                        })
                } else {
                    return resolve({ status: false })
                }
            })
    })
}

db.selectAccountPostId = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_account FROM post WHERE id_post=$1",
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.has = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT title FROM post WHERE id_post=$1",
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.addPost = (id_account, post) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO post (id_account, title, content) VALUES ($1, $2, $3) RETURNING *",
            [id_account, post.title, post.content],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.addPostTag = (id_post, id_tag) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO post_tag (id_post, id_tag) VALUES ($1, $2)",
            [id_post, id_tag],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            })
    })
}

db.changeStatus = (id_post, status_new) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE post SET status=$1 WHERE id_post=$2 RETURNING *",
            [status_new, id_post],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.changeAccess = (id_post, access_new) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE post SET access=$1 WHERE id_post=$2 RETURNING *",
            [access_new, id_post],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.checkPostAuthor = (id_post, id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT title FROM post WHERE id_post=$1 AND id_account=$2",
            [id_post, id_account],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.deletePost = (id) => {
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM post_tag WHERE id_post=$1',
            [id],
            (err, result) => {
                if (err) return reject(err);
            });
        pool.query('DELETE FROM post WHERE id_post=$1',
            [id],
            (err, result) => {
                if (err) return reject(err);
                console.log(result);
                return resolve(result.rows);
            });
    })
}

db.update = (id, post) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE post SET title=$1, content=$2, last_modified=CURRENT_TIMESTAMP WHERE id_post=$3",
            [post.title, post.content, id],
            (err, result) => {
                if (err) return reject(err);
                console.log(result);
                return resolve(result);
            })
    })
}

db.deletePostTag = (id_post) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE from post_tag WHERE id_post=$1", [id_post], (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        })
    })
}

db.getNewestPage = (page) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_post FROM post WHERE status=1 AND access=1 ORDER BY id_post DESC LIMIT 10 OFFSET $1",
            [(page - 1) * 10],
            (err, postResult) => {
                if (err) return reject(err);
                return resolve(postResult.rows)
            });

    })
}

db.getListPostIdOfAccount = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_post FROM post WHERE id_account=$1 AND status=1 AND access=1 ORDER BY id_post DESC",
            [id_account], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getDraftPosts = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_post FROM post WHERE id_account=$1 AND access=0 ORDER BY id_post DESC",
            [id_account], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getPublicPosts = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_post FROM post WHERE id_account=$1 AND access=1 ORDER BY id_post DESC",
            [id_account], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getUnlistedPosts = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_post FROM post WHERE id_account=$1 AND access=2 ORDER BY id_post DESC",
            [id_account], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

module.exports = db;