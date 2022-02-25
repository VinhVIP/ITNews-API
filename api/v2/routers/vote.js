const express = require('express');
const router = express.Router();

const Auth = require('../../../auth');
const Post = require('../module/post');
const Vote = require('../module/vote');

/**
 * Thêm vote bài viết
 * @params      id_post, type
 * @permisson   Đăng nhập mới được vote
 * @return      201: Vote thành công
 *              200: Thay đổi loại vote thành công
 *              400: Bài viết đã được vote trước đó hoặc loại vote k hợp lệ
 *              404: Bài viết không tồn tại
 */
router.post('/:id_post/:type', Auth.authenGTUser, async (req, res, next) => {
    try {
        let { id_post, type } = req.params;
        let id_account = Auth.tokenData(req).id_account;

        if (id_post != -1 && type != -1) {
            let postExists = await Post.has(id_post);

            if (!postExists) {
                return res.status(404).json({
                    message: 'Bài viết không tồn tại'
                })
            }
            if (type < 0 || type > 1) {
                return res.status(400).json({
                    message: 'Loại vote không hợp lệ'
                })
            }

            let voteExists = await Vote.has(id_account, id_post);
            if (voteExists) {
                await Vote.update(id_account, id_post, type);
                return res.status(200).json({
                    message: 'Thay đổi loại vote thành công'
                })
            }

            await Vote.add(id_account, {id_post, type});
            res.status(201).json({
                message: 'Thêm vote thành công'
            })

        } else {
            res.status(400).json({
                message: 'Thiếu dữ liệu'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Lấy loại vote của bản thân theo bài viết
 * 
 * @permisson   Đăng nhập mới được thực thi
 * @return      200: Thành công, trả về loại vote
 *              404: Bài viết chưa được vote hoặc k tồn tại
 */
router.get('/:id_post', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let id_post = req.params.id_post;

        let postExists = await Post.has(id_post);

        if (postExists) {
            let voteType = await Vote.getVoteType(id_account, id_post);

            if (voteType.status) {
                res.status(200).json({
                    message: 'Lấy loại vote thành công',
                    data: voteType.vote
                })
            } else {
                res.status(404).json({
                    message: 'Bạn chưa vote bài viết này'
                })
            }
        } else {
            res.status(404).json({
                message: 'Bài viết không tồn tại'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Xóa vote
 * 
 * @permission  Đăng nhập mới được thực thi
 * @return      200: Xóa thành công
 *              404: Bài viết không tồn tại hoặc chưa được vote trước đó
 */
router.delete('/:id_post', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let id_post = req.params.id_post;

        let postExists = await Post.has(id_post);

        if (postExists) {
            let voteType = await Vote.getVoteType(id_account, id_post);

            if (voteType.status) {
                await Vote.delete(id_account, id_post);
                res.status(200).json({
                    message: 'Xóa vote thành công'
                })
            } else {
                res.status(404).json({
                    message: 'Bạn chưa vote bài viết này nên không thẻ xóa vote'
                })
            }
        } else {
            res.status(404).json({
                message: 'Bài viết không tồn tại'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Thay đổi loại vote
 * @params       id_post, type
 * @permission  Đăng nhập mới được thực thi
 * @return      200: Sửa thành công
 *              500: Loại vote k hợp lệ
 *              404: Bài viết k tồn tại hoặc chưa được vote trước đó
 */
router.put('/:id_post/:type', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let { id_post, type } = req.params;

        if (type < 0 || type > 1) {
            return res.status(400).json({
                message: 'Loại vote không hợp lệ'
            })
        }

        let postExists = await Post.has(id_post);

        if (postExists) {
            let voteType = await Vote.getVoteType(id_account, id_post);

            if (voteType.status) {
                await Vote.update(id_account, id_post, type);
                res.status(200).json({
                    message: 'Sửa vote thành công'
                })
            } else {
                res.status(404).json({
                    message: 'Bạn chưa vote bài viết này nên không thể sửa vote'
                })
            }
        } else {
            res.status(404).json({
                message: 'Bài viết không tồn tại'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

module.exports = router;