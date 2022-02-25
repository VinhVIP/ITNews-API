const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
var Auth = require('../../../auth');

var Tag = require('../module/tag');
var Post = require('../module/post');
var Account = require('../module/account');
const e = require('express');

/**
 * Lấy tất cả thẻ
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      200: Thành công, trả về danh sách các thẻ
 */
router.get('/all', async (req, res, next) => {
    try {
        let idUser = false;
        const authorizationHeader = req.headers['authorization'];
        if (authorizationHeader) {
            const token = authorizationHeader.split(' ')[1];
            if (token) {
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
                    if (!err) {
                        idUser = Auth.tokenData(req).id_account;
                    }
                })
            }
        }

        let result;
        if (idUser) result = await Tag.selectAllByAccount(idUser);
        else result = await Tag.selectAll();

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
 * Tìm kiếm thẻ theo từ khóa
 * 
 * @permission 
 * @return      200: Trả về danh sách
 */
router.get('/search', async (req, res, next) => {
    try {
        let { k } = req.query;
        if (!k || k.trim().length == 0) {
            return res.status(400).json({
                message: "Chưa có từ khóa tìm kiếm"
            })
        }

        k = k.toLowerCase();

        let page = req.query.page;

        const authorizationHeader = req.headers['authorization'];

        let list = [];
        let ids;
        if (page) ids = await Tag.getSearch(k, page);
        else ids = await Tag.getSearch(k);

        if (authorizationHeader) {
            const token = authorizationHeader.split(' ')[1];
            if (!token) return res.sendStatus(401);

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(403);
                }
            })

            let idUser = Auth.tokenData(req).id_account;

            for (let tagId of ids) {
                let acc = await Tag.selectIdByAccount(tagId.id_tag, idUser);
                list.push(acc)
            }
        } else {
            for (let tagId of ids) {
                let acc = await Tag.selectId(tagId.id_tag);
                list.push(acc)
            }
        }
        return res.status(200).json({
            message: 'Tìm kiếm danh sách thẻ thành công',
            data: list
        });
        // }
    } catch (err) {
        console.log(err);
        return res.sendStatus(500)
    }
});

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
 * Lấy tất cả thẻ và thông tin trạng thái theo dõi thẻ của người dùng được chỉ định
 * 
 * @permisson   All
 * @return      200: Thành công, trả về danh sách các thẻ
 */
router.get('/:id_account/all', async (req, res, next) => {
    try {
        let accId = req.params.id_account;
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
        let idUser = false;
        const authorizationHeader = req.headers['authorization'];
        if (authorizationHeader) {
            const token = authorizationHeader.split(' ')[1];
            if (token) {
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
                    if (!err) {
                        idUser = Auth.tokenData(req).id_account;
                    }
                })
            }
        }

        let tagExists = await Tag.has(req.params.id);
        if (tagExists) {
            let result;
            if (idUser) result = await Tag.selectIdByAccount(req.params.id, idUser);
            else result = await Tag.selectId(req.params.id);

            res.status(200).json({
                message: 'Lấy tag thành công',
                data: result
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
 * Lấy 1 thẻ theo id và trạng thái follow của ng dùng được chỉ định
 * 
 * @permission  Ai cũng có thể thực thi
 * @return      200: Thành công, trả về thẻ cần lấy
 *              404: Không tìm thấy thể
 */
router.get('/:id_tag/account/:id_account', async (req, res, next) => {
    try {
        let id_tag = req.params.id_tag;
        let id_account = req.params.id_account;

        let result = await Tag.selectIdByAccount(id_tag, id_account);
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
 * Lấy 1 thẻ theo id của người dùng đang đăng nhập
 * 
 * @permission  User
 * @return      200: Thành công, trả về thẻ cần lấy
 *              404: Không tìm thấy thể
 */
router.get('/:id_tag/me', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let id_tag = req.params.id_tag;

        let result = await Tag.selectIdByAccount(id_tag, id_account);
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
router.get('/:id/posts', async (req, res, next) => {
    try {
        let { id } = req.params;
        let page = req.query.page;

        let tagExists = await Tag.has(id);
        if (tagExists) {
            let postsId;

            if (page) postsId = await Post.getPostOfTag(id, page);
            else postsId = await Post.getPostOfTag(id);

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