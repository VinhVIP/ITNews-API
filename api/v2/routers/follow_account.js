const express = require('express');
const router = express.Router();

const Auth = require('../../../auth');
const Account = require('../module/account');
const FollowAccount = require('../module/follow_account');

/**
 * Người dùng theo dõi 1 tài khoản khác
 * 
 * @permission  Đăng nhập
 * @return      200: Theo dõi thành công
 *              400: Đã theo dõi trước đó || K thể tự theo dõi chính mình
 *              404: Tài khoản theo dõi không tồn tại
 */
router.post('/:id_follower', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_follower = req.params.id_follower;
        let id_following = Auth.tokenData(req).id_account;

        if (id_follower === id_following) {
            return res.status(400).json({
                message: 'Không thể tự theo dõi bản thân'
            })
        }

        let accExists = await Account.has(id_follower);
        if (accExists) {
            let followed = await FollowAccount.has(id_follower, id_following);
            if (followed) {
                return res.status(400).json({
                    message: 'Bạn đã theo dõi tài khoản này rồi'
                })
            }

            // following theo dõi follower
            await FollowAccount.add(id_follower, id_following);

            res.status(200).json({
                message: 'Theo dõi thành công'
            })
        } else {
            res.status(404).json({
                message: 'Tài khoản không tồn tại'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Người dùng BỎ theo dõi 1 tài khoản khác
 * 
 * @permission  Đăng nhập
 * @return      200: Bỏ theo dõi thành công
 *              400: Chưa dõi trước đó 
 *              404: Tài khoản bỏ theo dõi không tồn tại
 */
router.delete('/:id_follower', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_follower = req.params.id_follower;
        let id_following = Auth.tokenData(req).id_account;

        let accExists = await Account.has(id_follower);
        if (accExists) {
            let followed = await FollowAccount.has(id_follower, id_following);
            if (!followed) {
                return res.status(400).json({
                    message: 'Bạn chưa theo dõi tài khoản này'
                })
            }

            await FollowAccount.delete(id_follower, id_following);
            res.status(200).json({
                message: 'Bỏ theo dõi thành công'
            })
        } else {
            res.status(404).json({
                message: 'Tài khoản không tồn tại'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Người dùng bỏ theo dõi tất cả tài khoản
 * 
 * @permission  Đăng nhập
 * @return      200: Thành công
 */
router.delete('/', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        await FollowAccount.deleteAll(id_account);
        res.status(200).json({
            message: 'Bỏ theo dõi tất cả tài khoản thành công'
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})


module.exports = router;