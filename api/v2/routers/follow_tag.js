const express = require('express');
const router = express.Router();

const Auth = require('../../../auth');

const Tag = require('../module/tag');
const FollowTag = require('../module/follow_tag');

/**
 * Người dùng theo dõi 1 tag
 * 
 * @permission  Đăng nhập
 * @return      200: Theo dõi thẻ thành công
 *              400: Thẻ đã theo dõi trước đó
 *              404: Thẻ không tồn tại
 */
router.post('/:id_tag', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_tag = req.params.id_tag;
        let id_account = Auth.tokenData(req).id_account;

        let tagExists = await Tag.has(id_tag);
        if (tagExists) {
            let followed = await FollowTag.has(id_account, id_tag);
            if (followed) {
                res.status(400).json({
                    message: 'Bạn đã theo dõi thẻ này rồi'
                })
            } else {
                await FollowTag.add(id_account, id_tag);
                res.status(200).json({
                    message: 'Theo dõi thẻ thành công'
                })
            }
        } else {
            res.status(404).json({
                message: 'Thẻ không tồn tại'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Người dùng bỏ theo dõi 1 tag
 * 
 * @permission  Đăng nhập
 * @return      200: Bỏ theo dõi thẻ thành công
 *              400: Thẻ chưa được theo dõi trước đó
 *              404: Thẻ không tồn tại
 */
router.delete('/:id_tag', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_tag = req.params.id_tag;
        let id_account = Auth.tokenData(req).id_account;

        let tagExists = await Tag.has(id_tag);
        if (tagExists) {
            let followed = await FollowTag.has(id_account, id_tag);

            if (followed) {
                await FollowTag.delete(id_account, id_tag);

                res.status(200).json({
                    message: 'Bỏ theo dõi thẻ thành công'
                })
            } else {
                res.status(400).json({
                    message: 'Bạn chưa theo dõi thẻ này'
                })
            }
        } else {
            res.status(404).json({
                message: 'Thẻ không tồn tại'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Người dùng bỏ theo dõi tất cả thẻ
 * 
 * @permission  Đăng nhập
 * @return      200: Thành công
 */
router.delete('/', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        await FollowTag.deleteAll(id_account);
        res.status(200).json({
            message: 'Bỏ theo dõi tất cả thẻ thành công'
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

module.exports = router;