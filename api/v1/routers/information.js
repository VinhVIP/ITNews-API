const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
var Auth = require('../../../auth');
const Information = require('../module/information');
const Account = require('../module/account')

const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

var upload = multer({
    storage: storage,
});

/**
 * Cập nhật logo
 * @body   image
 */
router.put('/update/logo', Auth.authenAdmin, upload.single('image'), async(req, res, next)=>{
    try{
        let file = req.file;

        if(!file){
            return res.status(400).json({
                message: 'Tải file không thành công'
            });
        }else{
            let old_image = await Information.selectLogo();
            fs.unlinkSync(old_image);
            let update = await Information.updateLogo(file.path);
            return res.status(200).json({
                message: "cập nhật logo thành công"
            })
        }
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Cập nhật tag
 * @body   image
 */
 router.put('/update/tag', Auth.authenAdmin, upload.single('image'), async(req, res, next)=>{
    try{
        let file = req.file;

        if(!file){
            return res.status(400).json({
                message: 'Tải file không thành công'
            });
        }else{
            let old_image = await Information.selectTag();
            fs.unlinkSync(old_image);
            let update = await Information.updateTag(file.path);
            return res.status(200).json({
                message: "cập nhật logo thành công"
            })
        }
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Cập nhật avatar mặc định
 * @body   image
 */
 router.put('/update/avatar', Auth.authenAdmin, upload.single('image'), async(req, res, next)=>{
    try{
        let file = req.file;

        if(!file){
            return res.status(400).json({
                message: 'Tải file không thành công'
            });
        }else{
            let old_image = await Information.selectAvatar();
            fs.unlinkSync(old_image);
            let update_information = await Information.updateAvatar(file.path);
            let update_account = await Account.updateAvatarDefault(old_image, file.path);
            return res.status(200).json({
                message: "cập nhật avatar thành công"
            })
        }
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Cập nhật name
 * @body   name
 */
 router.put('/update/name', Auth.authenAdmin, async(req, res, next)=>{
    try{
        let name = req.body.name;
        if(!name){
            return res.status(400).json({
                message:"thiếu body"
            })
        }

        let update = await Information.updateName(name);

        return res.status(200).json({
            message: "cập nhật tên thành công"
        })
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Cập nhật facebook
 * @body   facebook
 */
 router.put('/update/facebook', Auth.authenAdmin, async(req, res, next)=>{
    try{
        let facebook = req.body.facebook;
        if(!facebook){
            return res.status(400).json({
                message:"thiếu body"
            })
        }

        let update = await Information.updateFacebook(facebook);

        return res.status(200).json({
            message: "cập nhật facebook thành công"
        })
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Cập nhật android
 * @body   name
 */
 router.put('/update/android', Auth.authenAdmin, async(req, res, next)=>{
    try{
        let android = req.body.android;
        if(!android){
            return res.status(400).json({
                message:"thiếu body"
            })
        }

        let update = await Information.updateAndroid(android);

        return res.status(200).json({
            message: "cập nhật đường dẫn android thành công"
        })
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Cập nhật ios
 * @body   ios
 */
 router.put('/update/ios', Auth.authenAdmin, async(req, res, next)=>{
    try{
        let ios = req.body.ios;
        if(!ios){
            return res.status(400).json({
                message:"thiếu body"
            })
        }

        let update = await Information.updateIos(ios);

        return res.status(200).json({
            message: "cập nhật đường đẫn ios thành công"
        })
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Cập nhật thời hạn token
 * @body   token_days
 */
 router.put('/update/token', Auth.authenAdmin, async(req, res, next)=>{
    try{
        let token_days = req.body.token_days;
        if(!token_days){
            return res.status(400).json({
                message:"thiếu body"
            })
        }

        let update = await Information.updateToken(token_days);

        return res.status(200).json({
            message: "cập nhật token_days thành công"
        })
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Cập nhật thời hạn mã xác nhận
 * @body   code_minutes
 */
 router.put('/update/code', Auth.authenAdmin, async(req, res, next)=>{
    try{
        let code_minutes = req.body.code_minutes;
        if(!code_minutes){
            return res.status(400).json({
                message:"thiếu body"
            })
        }

        let update = await Information.updateCode(code_minutes);

        return res.status(200).json({
            message: "cập nhật code_minutes thành công"
        })
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Cập nhật 1 lượt
 * @body   logo, name, facebook, android, ios, token, code
 */
 router.put('/update/all', Auth.authenAdmin, async(req, res, next)=>{
    try{
        let code_minutes = req.body.code_minutes;
        let logo = req.body.logo;
        let name = req.body.name;
        let facebook = req.body.facebook;
        let android = req.body.android;
        let ios = req.body.ios;
        let token_days = req.body.token_days;
        if(code_minutes && logo && name && facebook && android && ios && token_days){
            let update = await Information.updateAll(logo, name, facebook, android, ios, token_days, code_minutes);
            return res.status(200).json({
                message: "cập nhật tất cả thành công"
            })
        }else{
            return res.status(400).json({
                message: "Thiếu body"
            })
        }
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Lấy logo
 */
router.get('/logo', async(req, res, next)=>{
    try{
        let path = await Information.selectLogo();
        let image = fs.readFile(path, (err, data)=>{
            if(err){
                return res.sendStatus(500);
            }else{
                res.status(200);
                return res.end(data);
            }
        });
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Lấy avatar mặc định
 */
 router.get('/avatar', async(req, res, next)=>{
    try{
        let path = await Information.selectAvatar();
        let image = fs.readFile(path, (err, data)=>{
            if(err){
                return res.sendStatus(500);
            }else{
                res.status(200);
                return res.end(data);
            }
        });
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Lấy logo tag mặc định
 */
 router.get('/tag', async(req, res, next)=>{
    try{
        let path = await Information.selectTag();
        let image = fs.readFile(path, (err, data)=>{
            if(err){
                return res.sendStatus(500);
            }else{
                res.status(200);
                return res.end(data);
            }
        });
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Lấy facebook
 */
 router.get('/facebook', async(req, res, next)=>{
    try{
        let data = await Information.selectFacebook();
        return res.status(200).json({
            message: "Lấy thành công",
            data: data
        })
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Lấy android
 */
 router.get('/android', async(req, res, next)=>{
    try{
        let data = await Information.selectAndroid();
        return res.status(200).json({
            message: "Lấy thành công",
            data: data
        })
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Lấy ios
 */
 router.get('/ios', async(req, res, next)=>{
    try{
        let data = await Information.selectIos();
        return res.status(200).json({
            message: "Lấy thành công",
            data: data
        })
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Lấy tất cả
 */
 router.get('/all', Auth.authenAdmin, async(req, res, next)=>{
    try{
        let data = await Information.selectAll();
        return res.status(200).json({
            message: "Lấy thành công",
            data: data
        })
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})
// router.('/', async(req, res, next)=>{
//     try{

//     }catch(err){
//         console.log(err);
//         return res.sendStatus(500);
//     }
// })

module.exports = router;