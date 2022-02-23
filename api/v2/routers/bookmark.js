const express = require('express');
const router = express.Router();

const Auth = require('../../../auth');
const Post = require('../module/post');
const Bookmark = require('../module/bookmark');

/**
 * Bookmark bài viết
 * @params      id_post
 * @permission  Đăng nhập mới được bookmark
 * @return      200: Lưu bài viết thành công
 *              400: Bài viết đã được bookmark trước đó
 *              404: Bài viết không tồn tại
 */
router.post('/:id_post', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_post = req.params.id_post;
        let id_account = Auth.tokenData(req).id_account;

        let postExists = await Post.has(id_post);
        if (postExists) {
            let bookmarkExists = await Bookmark.has(id_account, id_post);
            if (bookmarkExists) {
                res.status(400).json({
                    message: 'Bạn đã bookmark bài viết này rồi'
                })
            } else {
                await Bookmark.add(id_account, id_post);
                res.status(200).json({
                    message: 'Bookmark bài viết thành công'
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
 * Xóa bookmark
 * @params      id_post
 * @permission  Đăng nhập mới được xóa bookmark
 * @return      200: Xóa bookmark bài viết thành công
 *              400: Bài viết chưa được bookmark nên k thể xóa bookmark
 *              404: Bài viết không tồn tại
 */
router.delete('/:id_post', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_post = req.params.id_post;
        let id_account = Auth.tokenData(req).id_account;

        let postExists = await Post.has(id_post);
        if (postExists) {
            let bookmarkExists = await Bookmark.has(id_account, id_post);
            if (bookmarkExists) {
                await Bookmark.delete(id_account, id_post);

                res.status(200).json({
                    message: 'Xóa bookmark thành công'
                })
            } else {
                res.status(400).json({
                    message: 'Bạn chưa bookmark bài viết này nên không thể xóa bookmark'
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