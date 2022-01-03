const pool = require('../../../database');

const db = {};

db.addComment = (id_account, id_post, content) =>{
    return new Promise((resolve, reject)=>{
        pool.query("INSERT INTO comment (id_account, id_post, content, status) VALUES ($1, $2, $3, 0) RETURNING id_cmt",
        [id_account, id_post, content],
        (err, result)=>{
            if (err) return reject(err);
            return resolve(result.rows[0].id_cmt);
        });
    });
}

db.changeParent = (id_cmt)=>{
    return new Promise((resolve, reject)=>{
        pool.query("UPDATE comment SET id_cmt_parent = $1 where id_cmt = $1 returning *"
        ,[id_cmt],
        (err, result)=>{
            if(err) return reject (err);
            return resolve (result.rows[0]);
        });
    })
}

db.addCommentWithParent = (id_account, id_post, id_parent, content) =>{
    return new Promise((resolve, reject)=>{
        pool.query("INSERT INTO comment (id_account, id_post, id_cmt_parent, content, date_time, status) VALUES ($1, $2, $3, $4, current_date, 0) RETURNING *",
        [id_account, id_post, id_parent, content],
        (err, result)=>{
            if (err) return reject(err);
            return resolve(result.rows[0]);
        });
    });
}

db.updateComment = (id_comment, content) =>{
    return new Promise((resolve, reject)=>{
        pool.query("UPDATE comment SET content = $1 where id_cmt = $2",
        [content, id_comment],
        (err, result)=>{
            if (err) return reject(err);
            return resolve(result);
        });
    })
}

db.delete = (id_comment) =>{
    return new Promise((resolve, reject)=>{
        pool.query("DELETE from comment where id_cmt = $1",
        [id_comment],
        (err, result)=>{
            if (err) return reject(err);
            return resolve(result.rows[0]);
        });
    });
}

db.deleteParent = (id_comment)=>{
    return new Promise((resolve, reject)=>{
        pool.query("DELETE FROM comment where id_cmt in (SELECT id_cmt FROM comment where id_cmt_parent = $1)",
        [id_comment],
        (err, result)=>{
            if(err) return reject (err);
            return resolve(result.rows[0]);
        });
    });
}

db.listCommentInPost = (id_post) =>{
    return new Promise((resolve, reject)=>{
        pool.query(`select a.id_account, a.real_name, a.account_name, a.id_role,
        a.avatar, c.id_cmt, c.content, c.id_cmt_parent, c.status,
        TO_CHAR(c.date_time:: date, 'dd/mm/yyyy') AS day,
        TO_CHAR(c.date_time:: time, 'hh24:mi') AS time
        from comment c, account a 
        WHERE c.id_account = a.id_account and 
        id_post = $1 
        ORDER BY id_cmt_parent, date_time`,
        [id_post],
        (err, result)=>{
            if (err) return reject (err);
            return resolve(result.rows)
        });
    });
}

db.listMainCommentInPost = (id_post) =>{
    return new Promise((resolve, reject)=>{
        pool.query(`select a.id_account, a.real_name, a.account_name, a.id_role, a.avatar,
            c.id_cmt, c.content, c.id_cmt_parent, c.status,
            TO_CHAR(c.date_time:: date, 'dd/mm/yyyy') AS day,
            TO_CHAR(c.date_time:: time, 'hh24:mi') AS time
            from comment c, account a 
            WHERE c.id_account = a.id_account and 
            c.id_cmt = c.id_cmt_parent and 
            id_post = $1 
            ORDER BY id_cmt_parent, date_time`,
        [id_post],
        (err, result)=>{
            if (err) return reject (err);
            return resolve(result.rows)
        });
    });
}

db.listReplyInComment = (id_cmt) =>{
    return new Promise((resolve, reject)=>{
        pool.query(`select a.id_account, a.real_name, a.account_name, a.id_role, a.avatar,
            c.id_cmt, c.content, c.id_cmt_parent, c.status,
            TO_CHAR(c.date_time:: date, 'dd/mm/yyyy') AS day,
            TO_CHAR(c.date_time:: time, 'hh24:mi') AS time 
            from comment c, account a 
            WHERE c.id_account = a.id_account and 
            c.id_cmt_parent = $1 
            ORDER BY id_cmt_parent, date_time`,
        [id_cmt],
        (err, result)=>{
            if (err) return reject (err);
            return resolve(result.rows)
        });
    });
}

db.listAllCommentInPost = (id_post) =>{
    return new Promise((resolve, reject)=>{
        pool.query(`select a.id_account, a.real_name, a.account_name, a.id_role, a.avatar, 
            c.id_cmt, c.content, c.id_cmt_parent, c.status,
            TO_CHAR(c.date_time:: date, 'dd/mm/yyyy') AS day,
            TO_CHAR(c.date_time:: time, 'hh24:mi') AS time
            from comment c, account a 
            where c.id_account = a.id_account and id_post = $1 
            order by id_cmt_parent, date_time`,
        [id_post],
        (err, result)=>{
            if (err) return reject (err);
            return resolve(result.rows)
        });
    });
}

db.has = (id_cmt)=>{
    return new Promise((resolve, reject)=>{
        pool.query("select * from comment where id_cmt = $1",
        [id_cmt],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rowCount>0)
        });
    })
}

db.selectAccountComment = (id_cmt)=>{
    return new Promise((resolve, reject)=>{
        pool.query("select id_account from comment where id_cmt = $1",
        [id_cmt],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0]);
        });
    })
}

db.selectId = (id_cmt)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`select a.id_account, a.real_name, a.account_name, a.id_role, a.avatar, 
        c.id_cmt, c.content, c.id_cmt_parent, c.status,
        TO_CHAR(c.date_time:: date, 'dd/mm/yyyy') AS day,
        TO_CHAR(c.date_time:: time, 'hh24:mi') AS time
        from comment c, account a 
        where c.id_cmt=$1 and c.id_account = a.id_account`,
        [id_cmt],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0])
        })
    })
}

db.changeStatus = (id_cmt, new_status)=>{
    return new Promise((resolve, reject)=>{
        pool.query("UPDATE comment SET status = $1 where id_cmt = $2 returning *",
        [new_status, id_cmt],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0])
        });
    });
}

db.selectPostComment = (id_cmt)=>{
    return new Promise((resolve, reject)=>{
        pool.query("SELECT id_post FROM comment where id_cmt=$1",
        [id_cmt],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0]);
        });
    });
}

module.exports = db;