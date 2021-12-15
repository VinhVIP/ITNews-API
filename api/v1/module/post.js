const pool = require('../../../database');

const db = {};

db.selectId = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT P.*,
		TO_CHAR(created :: time, 'hh24:mi') as time_created,
        TO_CHAR(created :: date, 'dd/mm/yyyy') as day_created,
        TO_CHAR(last_modified :: time, 'hh24:mi') as time_last_modified,
        TO_CHAR(last_modified :: date, 'dd/mm/yyyy') as day_last_modified,
        false as bookmark_status,
        (select count(*) from comment C where C.id_post=$1) as total_comment,
        (select count(*) from vote V where V.id_post=$1 and V.type=0) as total_vote_down,
        (select count(*) from vote V where V.id_post=$1 and V.type=1) as total_vote_up,
        (select count(*) from bookmark B where B.id_post=$1) as total_bookmark
        FROM post P
        WHERE P.id_post=$1`,
            [id],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.selectIdForUser = (id_post, id_user) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT P.*,
        TO_CHAR(created :: time, 'hh24:mi') as time_created,
        TO_CHAR(created :: date, 'dd/mm/yyyy') as day_created,
        TO_CHAR(last_modified :: time, 'hh24:mi') as time_last_modified,
        TO_CHAR(last_modified :: date, 'dd/mm/yyyy') as day_last_modified,
        (select exists(select * from bookmark where id_post=$1 and id_account=$2)) as bookmark_status,
        (select count(*) from comment C where C.id_post=$1) as total_comment,
        (select count(*) from vote V where V.id_post=$1 and V.type=0) as total_vote_down,
        (select count(*) from vote V where V.id_post=$1 and V.type=1) as total_vote_up,
        (select count(*) from bookmark B where B.id_post=$1) as total_bookmark
        FROM post P
        WHERE P.id_post=$1`,
            [id_post, id_user],
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

db.isPublic = (id_post) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT id_post FROM post WHERE id_post=$1 and access=1',
            [id_post],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
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
        pool.query("INSERT INTO post (id_account, title, content, access) VALUES ($1, $2, $3, $4) RETURNING *",
            [id_account, post.title, post.content, post.access],
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

db.getTrending = () => {
    return new Promise((resolve, reject) => {
        pool.query(`select P.id_post, count(P.id_post) rating
        from post P, vote V 
        where P.id_post=V.id_post 
        group by P.id_post
        order by rating desc`,
            [],
            (err, postResult) => {
                if (err) return reject(err);
                return resolve(postResult.rows)
            });

    })
}

db.getNewest = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_post FROM post WHERE status=1 AND access=1 ORDER BY created DESC",
            [],
            (err, postResult) => {
                if (err) return reject(err);
                return resolve(postResult.rows)
            });

    })
}

db.getAllNewest = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_post FROM post WHERE status=1 AND access=1 ORDER BY created DESC",
            [],
            (err, postResult) => {
                if (err) return reject(err);
                return resolve(postResult.rows)
            });

    })
}

db.getSearch = (page, search) => {
    return new Promise((resolve, reject) => {
        pool.query(`WITH searched AS (
                SELECT id_post, view, 
                POSITION(LOWER($1) IN LOWER(title)) AS title, 
                POSITION(LOWER($1) IN LOWER(content)) AS content 
                FROM post
                WHERE status=1 AND access=1)
            SELECT * FROM searched 
            WHERE title >0 OR content >0 
            ORDER BY view DESC
            `,
            [search],
            (err, postResult) => {
                if (err) return reject(err);
                return resolve(postResult.rows)
            });

    })
}

db.getFollowing = (id_account) => {
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
            `,
            [id_account],
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

db.getPostOfTag = (id_tag) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT P.id_post
        FROM post p
        JOIN post_tag PT ON P.id_post = PT.id_post
        WHERE PT.id_tag=$1 AND P.access=1 AND P.status=1
        ORDER BY P.created DESC
        `,
            [id_tag], (err, result) => {
                if (err) return reject(err)
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

db.getPostsByStatus = (status) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_post FROM post P WHERE P.status=$1 ORDER BY P.created",
            [status], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getPostsForBrowse = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_post FROM post P WHERE P.status=0 and P.access=1 ORDER BY P.created",
            [], (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

module.exports = db;