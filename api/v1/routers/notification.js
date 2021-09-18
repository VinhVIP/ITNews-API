const express = require('express');
const router = express.Router();
var Auth = require('../../../auth');
var Account = require('../module/account');
var Notification = require('../module/notification');


/**
 * Xóa thông báo
 * @permisson   Người được nhận thông báo đó
 *              
 * @return      200: Đổi ảnh thành công
 *              400: Lỗi tải file
 *              401: Tải khoản không có quyền
 *              404: Thông báo không tồn tại
 */
router.delete('/:id_notification', Auth.authenGTUser, async(req, res, next)=>{
    try{
        let id_notificatioin = req.params.id_notification;
        let exist = await Notification.has(id_notificatioin);
        
        if(!exist){
            return res.status(404).json({
                message: 'Thông báo không tồn tại'
            });
        }

        let id_account = await Notification.selectAccount(id_notificatioin);

        if(id_account != Auth.tokenData(req).id_account){
            return res.status(401).json({
                message: 'Bạn không có quyền xóa thông báo này',
                id1: id_account,
                id2: Auth.tokenData(req).id_account
            });
        }else{
            let deleted = await Notification.deleteNotification(id_notificatioin);
            return res.status(200).json({
                message: 'Xóa thông báo thành công'
            });
        }
        
    }catch(err){
        return res.sendStatus(500);
    }
});

/**
 * Lấy thông báo theo trang
 * @permisson   Tải khoản được tạo
 * 
 * @return      200: Lấy thành công
 */
router.get('/page/:page_number', Auth.authenGTUser, async(req, res, next)=>{
    try{
        let page = req.params.page_number;
        let id_account = Auth.tokenData(req).id_account;
        let amount = await Notification.amount(id_account);

        let data = await Notification.listNotification(id_account, page);
        return res.status(200).json({
            message: 'List thông báo thành công',
            amount: amount,
            data: data,
        });
    }catch(err){
        return res.sendStatus(500);
    }
});

/**
 * Vô thông báo để xác nhận đã xem
 * @permisson   Tài khoản đã tạo
 *              
 * @return      200: Vô thành công, trả về link để vô trang cần đến
 *              404: Thông báo không tồn tại
 */
router.get('/:id_notification', Auth.authenGTUser, async(req, res, next)=>{
    try{
        let id_notificatioin = req.params.id_notification;
        let exist = await Notification.has(id_notificatioin);

        if(!exist){
            return res.status(404).json({
                message: 'Thông báo không tồn tại'
            });
        }else{
            let status = await Notification.readNotification(id_notificatioin);
            let url = await Notification.selectUrl(id_notificatioin);
            return res.status(200).json({
                message: 'Vô thành công, chuyển đường dẫn',
                link: url
            });
        }
        
    }catch(err){
        return res.sendStatus(500);
    }
});

module.exports = router;