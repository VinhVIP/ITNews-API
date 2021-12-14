const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
var Auth = require('../../../auth');
var Account = require('../module/account');
var Image = require('../module/image');

const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// const fileFilter = (req, file, cb) => {
//     // reject a file
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// };

var upload = multer({
    storage: storage,
});

/**
 * Lấy hình theo id
 * @permisson   Những người có tài khoản
 *             
 * @return      200: Trả về hình
 *              400: Đọc file bị lỗi
 *              404: Không thấy hình cần
 */
router.get('/:id_image', async(req, res, next) => {
    try{
        let id_image = req.params.id_image;
        let has = await Image.has(id_image);

        if(!has){
            return res.status(404).json({
                message: 'Hình này không tồn tại'
            })
        }else{
            let path = await Image.selectUrl(id_image);
            let image = fs.readFile(path, (err, data)=>{
                if(err){
                    res.status(400).json({
                        message: 'không thể đọc file'
                    })
                }else{
                    res.status(200);
                    return res.end(data);
                }
            });
        }
    }catch(error){
        console.log(error);
        return res.sendStatus(500);
    }
});

/**
 * Xóa hình theo id_image
 * @permisson   Những người có tài khoản đăng hình đấy hoặc admin hoặc mor
 *              Không dùng cho tài khoản bị khóa
 * @return      200: Xóa thành công
 *              401: Tài khoản không có quyền thực hiện
 *              403: Tài khoản đã bị khóa
 *              404: Không thấy hình
 */
router.delete('/:id_image', Auth.authenGTUser, async(req, res, next)=>{
    try{
        let id_image = req.params.id_image;
        let has = await Image.has(id_image);

        if(!has){
            return res.status(404).json({
                message: 'Hình này không tồn tại'
            })
        }

        let acc = await Account.selectId(Auth.tokenData(req).id_account);
        let poster = await Image.selectAccount(id_image);
        let path = await Image.selectUrl(id_image);

        if(acc.account_status !=0){
            return res.status(403).json({
                message: 'Tài khoản này đang bị khóa'
            })
        }

        if(poster === acc.id_account || acc.account_status == 1 || acc.account_status == 2){
            fs.unlinkSync(path);
            let del = await Image.deleteImage(id_image);
            return res.status(200).json({
                message: 'Xóa thành công'
            })
        }else{
            return res.status(401).json({
                message: 'Tài khoản không có quyền thực hiện'
            })
        }       

    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
});

/**
 * Đăng ảnh
 * @body        file hình
 * @permisson   Những người có tài khoản
 *              Không dùng cho tài khoản bị khóa
 * @return      200: Đăng ảnh thành công, trả về id ảnh đã đăng
 *              400: Không nhận được file
 *              403: Tài khoản đã bị khóa
 */
router.post('/', Auth.authenGTUser, upload.single('image'), async (req, res, next) => {
    try{
        let file = req.file;
        let acc = await Account.selectId(Auth.tokenData(req).id_account);
    
        if(acc.account_status !=0){
            fs.unlinkSync(file.path);
            return res.status(403).json({
                message: 'Tài khoản này đang bị khóa'
            })
        }
        
        if (!file) {
            return res.status(400).json({
                message: 'Không nhận được file'
            });
        }else{
            let save = await Image.addImage(acc.id_account, file.path);
            return res.status(200).json({
                message: 'tải tệp thành công',
                data: save,
            });
        }
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
});

/**
 * Lấy các id_image theo page của tài khoản đã đăng
 * @permisson   Những người có tài khoản
 *              Những tài khoản admin, mor được xem tất cả hình
 *              Không dùng cho tài khoản bị khóa
 * @return      200: Lấy ảnh thành công, trả về các id
 *              401: Tài khoản không có quyền xem của người khác
 *              402: Sai đinh dạng page number
 *              403: Tài khoản đã bị khóa
 *              404: Tài khoản không tồn tại
 */
router.get('/account/page/:page_number', Auth.authenGTUser, async(req, res, next)=>{
    try{
        let id_account = Auth.tokenData(req).id_account;
        let page = Number(req.params.page_number);

        if(!isNumber(page)){
            return res.status(402).json({
                message: 'page number sai định dạng'
            });
        }

        let acc = await Account.selectId(id_account);
        let data = await Image.listImageInAccount(id_account, page);
        let amount = await Image.amountImageInAccount(id_account);
        
        return res.status(200).json({
            message: 'Thao tác thành công',
            data: data,
            amount: amount
        });     
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
});

/**
 * Đổi ảnh
 * @body        file ảnh
 * @permisson   Những người đăng ảnh đó
 *              Không dùng cho tài khoản bị khóa
 * @return      200: Đổi ảnh thành công
 *              400: Lỗi tải file
 *              401: Tải khoản không có quyền
 *              403: Tài khoản đã bị khóa
 *              404: Không thấy hình cần đổi
 */
router.patch('/change/:id_image', Auth.authenGTUser, upload.single('image'), async (req, res, next)=>{
    try{
        let id_image = req.params.id_image;
        let acc = await Account.selectId(Auth.tokenData(req).id_account);
        let has = await Image.has(id_image);
        if(!has){
            return res.status(404).json({
                message: 'Hình này không tồn tại'
            });
        }

        let file = req.file;
        let image = await Image.selectImage(id_image);

        if(acc.account_status != 0){
            return res.status(403).json({
                message: 'Tài khoản này đang bị khóa'
            });
        }

        if(!file){
            return res.status(400).json({
                message: 'Tải file không thành công'
            });
        }

        if(image.id_account === acc.id_account){
            fs.unlinkSync(image.url);
            let change = await Image.changeImage(id_image, file.path);
            return res.status(200).json({
                message: 'Thay đổi thành công'
            });
        }else{
            return res.status(401).json({
                message: 'Tài khoản không có quyền thực hiện'
            });
        } 

    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})

function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); } 

module.exports = router;