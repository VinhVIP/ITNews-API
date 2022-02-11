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
router.delete('/:id_notification', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_notificatioin = req.params.id_notification;
        let exist = await Notification.has(id_notificatioin);

        if (!exist) {
            return res.status(404).json({
                message: 'Thông báo không tồn tại'
            });
        }

        let id_account = await Notification.selectAccount(id_notificatioin);

        if (id_account != Auth.tokenData(req).id_account) {
            return res.status(401).json({
                message: 'Bạn không có quyền xóa thông báo này',
                id1: id_account,
                id2: Auth.tokenData(req).id_account
            });
        } else {
            let deleted = await Notification.deleteNotification(id_notificatioin);
            return res.status(200).json({
                message: 'Xóa thông báo thành công'
            });
        }

    } catch (err) {
        return res.sendStatus(500);
    }
});

/**
 * Lấy thông báo theo trang
 * @permisson   Tải khoản được tạo
 * 
 * @return      200: Lấy thành công
 */
router.get('/all', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let data = await Notification.listNotification(id_account);
        return res.status(200).json({
            message: 'List thông báo chưa đọc thành công',
            data: data,
        });
    } catch (err) {
        return res.sendStatus(500);
    }
});

/**
 * Lấy tất cả thông báo 
 * @permisson   Tải khoản được tạo
 * 
 * @return      200: Lấy thành công
 */
router.get('/list', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let data = await Notification.listAllNotification(id_account);
        return res.status(200).json({
            message: 'List thông báo thành công',
            data: data,
        });
    } catch (err) {
        return res.sendStatus(500);
    }
});

/**
 * Đánh dấu đã đọc tất cả thông báo của user
 * @permisson   Đăng nhập
 * 
 * @return      200: thành công
 */
router.get('/read_all', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let data = await Notification.readAllNotification(id_account);
        return res.status(200).json({
            message: 'Đánh dấu đọc tất cả thông báo thành công',
            data: data,
        });
    } catch (err) {
        return res.sendStatus(500);
    }
});

/**
 * Xóa tất cả thông báo của user
 * @permisson   Đăng nhập
 * 
 * @return      200: thành công
 */
router.delete('/delete_all', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let data = await Notification.deleteAllNotification(id_account);
        return res.status(200).json({
            message: 'Xóa tất cả thông báo thành công',
            data: data,
        });
    } catch (err) {
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
router.get('/:id_notification', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_notificatioin = req.params.id_notification;
        let exist = await Notification.has(id_notificatioin);

        if (!exist) {
            return res.status(404).json({
                message: 'Thông báo không tồn tại'
            });
        } else {
            let data = await Notification.selectID(id_notificatioin);
            return res.status(200).json({
                message: 'Lấy thông báo thành công',
                data: data
            });
        }

    } catch (err) {
        console.log(err);
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
router.get('/:id_notification/read', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_notification = req.params.id_notification;
        let exist = await Notification.has(id_notification);
        let id_account = Auth.tokenData(req).id_account;

        if (!exist) {
            return res.status(404).json({
                message: 'Thông báo không tồn tại'
            });
        } else {
            let notification = await Notification.selectID(id_notification)
            if (notification.id_account !== id_account) {
                return res.status(403).json({
                    message: 'Bạn không có quyền đọc thông báo của người khác!'
                })
            }

            await Notification.readNotification(id_notification);
            return res.status(200).json({
                message: 'Đọc thông báo thành công',
            });
        }

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
});

module.exports = router;