const express = require('express');
const router = express.Router();
var Auth = require('../../../auth');

var Tag = require('../module/tag');
var Post = require('../module/post');
var Account = require('../module/account');

/**
 * Lấy tất cả thẻ
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      200: Thành công, trả về danh sách các thẻ
 */
router.get('/all', async (req, res, next) => {
    try {
        let result = await Tag.selectAll();
        res.status(200).json({
            message: 'Lấy danh sách thẻ thành công',
            data: result
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Lấy tất cả thẻ và thông tin trạng thái theo dõi thẻ của người dùng hiện tại
 * 
 * @permisson   Người dùng
 * @return      200: Thành công, trả về danh sách các thẻ
 */
 router.get('/me', Auth.authenGTUser, async (req, res, next) => {
    try {
        let accId = Auth.tokenData(req).id_account;
        let result = await Tag.selectAllByAccount(accId);
        res.status(200).json({
            message: 'Lấy danh sách thẻ thành công',
            data: result
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Lấy tất cả thẻ và thông tin trạng thái theo dõi thẻ của người dùng hiện tại
 * 
 * @permisson   Người dùng
 * @return      200: Thành công, trả về danh sách các thẻ
 */
 router.get('/:id/all', async (req, res, next) => {
    try {
        let accId = req.params.id;
        let result = await Tag.selectAllByAccount(accId);
        res.status(200).json({
            message: 'Lấy danh sách thẻ thành công',
            data: result
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Lấy 1 thẻ theo id
 * 
 * @permission  Ai cũng có thể thực thi
 * @return      200: Thành công, trả về thẻ cần lấy
 *              404: Không tìm thấy thể
 */
router.get('/:id', async (req, res, next) => {
    try {
        let result = await Tag.selectId(req.params.id);
        if (result.status) {
            res.status(200).json({
                message: 'Lấy tag thành công',
                data: result.data
            })
        } else {
            res.status(404).json({
                message: 'Không tìm thấy tag'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Thêm mới 1 thẻ
 * 
 * @permisson   Chỉ Moder trở lên mới được thêm thẻ mới
 * @return      201: Thêm thành công, trả về thẻ vừa được thêm
 *              400: Thiếu dữ liệu (tên thẻ)
 */
router.post('/', Auth.authenGTModer, async (req, res, next) => {
    try {
        let { name } = req.body;

        if (name) {
            let result = await Tag.add(req.body);

            res.status(201).json({
                message: 'Tạo mới thẻ thành công',
                data: result
            })
        } else {
            res.status(400).json({
                message: 'Thiếu tên thẻ'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Chỉnh sửa 1 thẻ theo id
 * 
 * @permisson   Chỉ Moder trở lên mới được thực thi
 * @return      200: Cập nhật thành công, trả về thẻ sau khi thay đổi
 *              400: Thiếu dữ liệu
 *              404: Không tìm thấy thẻ để sửa
 */
router.put('/:id', Auth.authenGTModer, async (req, res, next) => {
    try {
        let id = req.params.id;
        let tagExists = await Tag.has(id);

        if (tagExists) {
            let { name, logo } = req.body;

            if (name && logo) {
                let result = await Tag.update(id, req.body);

                res.status(200).json({
                    message: 'Cập nhật thẻ thành công',
                    data: result
                })
            } else {
                res.status(400).json({
                    message: 'Thiếu dữ liệu'
                })
            }
        } else {
            res.status(404).json({
                message: 'Không tìm thấy tag để sửa'
            })
        }

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Lấy danh sách bài viết thuộc thẻ có id theo trang
 * 
 * @permission  Ai cũng có thể thực thi
 * @return      200: thành công, trả về danh sách
 *              404: Thẻ không tồn tại
 */
router.get('/:id/posts/:page', async (req, res, next) => {
    try {
        let { id, page } = req.params;

        let tagExists = await Tag.has(id);
        if (tagExists) {
            let postsId = await Post.getPostOfTag(id, page);
            let data = [];

            for (let i = 0; i < postsId.length; i++) {
                let id_post = postsId[i].id_post;

                let post = await Post.selectId(id_post);
                let acc = await Account.selectId(post.id_account);
                let tags = await Post.selectTagsOfPost(id_post);

                data.push({
                    post: post,
                    author: acc,
                    tags: tags
                })
            }

            res.status(200).json({
                message: `Lấy danh sách bài viết thành công`,
                data: data
            })
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