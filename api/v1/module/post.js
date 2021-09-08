const pool = require('../../../database');

const db = {};

db.selectId = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM post WHERE id_post=$1",
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.selectTagsOfPost = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT T.*
        FROM tag T
        INNER JOIN post_tag PT ON PT.id_tag=T.id_tag
        WHERE PT.id_post=$1`,
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
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

db.getView = (id) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT view FROM post WHERE id_post=$1", [id], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rows[0]);
        })
    })
}

db.updateView = (id, view) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE post SET view=$1 WHERE id_post=$2", [view, id], (err, result) => {
            if (err) return reject(err);
            return resolve(result.rows[0]);
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
        pool.query("SELECT id_post FROM post WHERE status=1 AND access=1 ORDER BY created DESC LIMIT 10 OFFSET $1",
            [(page - 1) * 10],
            (err, postResult) => {
                if (err) return reject(err);
                return resolve(postResult.rows)
            });

    })
}

db.getFollowingPage = (id_account, page) => {
    return new Promise((resolve, reject) => {
        pool.query(`(SELECT P.*
            FROM post P
            INNER JOIN post_tag PT ON P.id_post=PT.id_post
            WHERE PT.id_tag IN (
                SELECT FT.id_tag
                FROM follow_tag FT
                WHERE FT.id_account=$1
            )
            ORDER BY P.created DESC)
            UNION
            (SELECT P.*
                    FROM post P
                    INNER JOIN follow_account F ON F.id_follower=P.id_account
                    WHERE F.id_following=$1 AND P.status=1 AND P.access=1 
                    ORDER BY P.created DESC )
            LIMIT 10 OFFSET $2`,
            [id_account, (page - 1) * 10],
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

db.getPostOfTag = (id_tag, page) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT P.id_post
        FROM post p
        JOIN post_tag PT ON P.id_post = PT.id_post
        WHERE PT.id_tag=$1 AND P.access=1 AND P.status=1
        ORDER BY P.created DESC
        LIMIT 10 OFFSET $2`,
            [id_tag, (page - 1) * 10], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows)
            })
    })
}

db.getTotalView = (id_account) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT SUM(P.view) FROM post P WHERE P.id_account=$1",
            [id_account], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].sum);
            })
    })
}

db.getPostsByStatus = (status, page) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_post FROM post P WHERE P.status=$1 ORDER BY P.created DESC LIMIT 10 OFFSET $2",
            [status, page], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

module.exports = db;