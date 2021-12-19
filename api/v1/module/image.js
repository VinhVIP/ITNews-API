const pool = require('../../../database');

const db = {};

db.addImage = (id_account, url)=>{
    return new Promise((resolve, reject)=>{
        pool.query('INSERT INTO image (id_account, url) VALUES ($1, $2) returning id_image',
        [id_account, url],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].id_image)
        });
    });
}

db.changeImage = (id_image, url)=>{
    return new Promise((resolve, reject)=>{
        pool.query('UPDATE image SET url = $1 WHERE id_image = $2',
        [url, id_image],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0])
        });
    });
}

db.deleteImage = (id_image) =>{
    return new Promise((resolve, reject)=>{
        pool.query('DELETE FROM image WHERE id_image = $1',
        [id_image],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0])
        });
    });
}

db.selectUrl = (id_image)=>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT url FROM image WHERE id_image = $1',
        [id_image],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].url)
        });
    });
}

db.selectAccount = (id_image)=>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT id_account FROM image WHERE id_image = $1',
        [id_image],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].id_account)
        });
    });
}

db.has = (id_image)=>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT * FROM image WHERE id_image = $1',
        [id_image],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rowCount>0);
        });
    });
}

db.listImageInAccount = (id_account)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT id_image, url FROM image 
        WHERE id_account = $1 
        ORDER BY id_image`,
        [id_account],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows);
        });
    });
}

db.amountImageInAccount = (id_account)=>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT id_image FROM image WHERE id_account = $1',
        [id_account],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rowCount);
        });
    });
}

db.selectImage = (id_image)=>{
    return new Promise((resolve, reject)=>{
        pool.query('SELECT * FROM image WHERE id_image = $1',
        [id_image],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0])
        });
    });
}

module.exports = db;