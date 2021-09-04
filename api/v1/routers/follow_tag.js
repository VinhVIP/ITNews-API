const express = require('express');
const router = express.Router();

const Auth = require('../../../auth');

const Tag = require('../module/tag');
const FollowTag = require('../module/follow_tag');

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

module.exports = router;