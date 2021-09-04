const express = require('express');
const router = express.Router();

const Auth = require('../../../auth');
const Account = require('../module/account');
const FollowAccount = require('../module/follow_account');


router.post('/:id_follower', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_follower = req.params.id_follower;
        let id_following = Auth.tokenData(req).id_account;

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


module.exports = router;