const pool = require('../../../database');

const db = {};

db.updateLogo = (logo)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`UPDATE information SET logo = $1`,
        [logo],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.updateAvatar = (avatar)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`UPDATE information SET avatar = $1`,
        [avatar],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.updateTag = (tag)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`UPDATE information SET logo_tag = $1`,
        [tag],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.updateName = (name)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`UPDATE information SET name = $1`,
        [name],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.updateFacebook = (facebook)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`UPDATE information SET facebook = $1`,
        [facebook],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.updateAdroid = (android)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`UPDATE information SET android = $1`,
        [android],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.updateIos = (ios)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`UPDATE information SET ios = $1`,
        [ios],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.updateToken = (token_days)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`UPDATE information SET token_valid = $1`,
        [token_days],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.updateCode = (code_minutes)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`UPDATE information SET code_confirm = $1`,
        [code_minutes],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.updateAll = (logo, name, facebook, android, ios, token, code)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`UPDATE information SET
            logo = $1, name = $2, facebook = $3,
            android = $4, ios = $5, token_valid = $6,
            code_confirm = $7`,
        [logo, name, facebook, android, ios, token, code],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows);
        })
    })
}

db.selectLogo = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT logo FROM information`,
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].logo);
        })
    })
}

db.selectTag = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT logo FROM logo_tag`,
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].logo);
        })
    })
}

db.selectAvatar = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT avatar FROM information`,
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].avatar);
        })
    })
}

db.selectToken = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT token_valid FROM information`,
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].token_valid);
        })
    })
}

db.selectCode = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT code_confirm FROM information`,
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].code_confirm);
        })
    })
}

db.selectAll = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT * FROM information`,
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0]);
        })
    })
}


db.selectName = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT name FROM information`,
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].name);
        })
    })
}


db.selectFacebook = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT facebook FROM information`,
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].facebook);
        })
    })
}


db.selectAndroid = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT android FROM information`,
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].android);
        })
    })
}


db.selectIos = ()=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT ios FROM information`,
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].ios);
        })
    })
}

// db. = ()=>{
//     return new Promise((resolve, reject)=>{
//         pool.query(``,
//         [],
//         (err, result)=>{
//             if(err) return reject(err);
//             return resolve(result.rows);
//         })
//     })
// }

module.exports = db;