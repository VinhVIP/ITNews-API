const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
var Auth = require('../../../auth');
var MyDrive = require('../../../drive');
var Tag = require('../module/tag');
var Post = require('../module/post');
var Account = require('../module/account');
const e = require('express');

/**
 * Lấy tất cả thẻ
 * 
 * @permisson   Theo token
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
 * @query       k
 * @permission  Theo token
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
 * Lấy 1 thẻ theo id
 * 
 * @permission  Theo token
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
 * Thêm mới 1 thẻ
 * @body        name, logo
 * @permisson   Chỉ Moder trở lên mới được thêm thẻ mới
 * @return      201: Thêm thành công, trả về thẻ vừa được thêm
 *              400: Thiếu dữ liệu (tên thẻ)
 */
router.post('/', Auth.authenGTModer, async (req, res, next) => {
    try {
        if (!req.files) {
            return res.status(400).json({
                message: 'Không có logo được tải lên'
            });
        }

        let logo = req.files.logo;
        if (!logo) {
            return res.status(400).json({
                message: 'Không có logo được tải lên'
            });
        }

        let { name } = req.body;

        if (name) {
            let tagNameExists = await Tag.hasName(name);
            if (tagNameExists) {
                return res.status(400).json({
                    message: 'Tên tag đã bị trùng'
                });
            }

            let idLogo = await MyDrive.uploadImage(logo, name);
            if (!idLogo) {
                return res.status(400).json({
                    message: "Lỗi upload logo"
                })
            } else {
                let logoPath = "https://drive.google.com/uc?export=view&id=" + idLogo;
                let result = await Tag.add(name, logoPath);

                res.status(201).json({
                    message: 'Tạo mới thẻ thành công',
                    data: result
                })
            }


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
 * @params      id
 * @body        name, logo
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
            let { name } = req.body;

            if (name) {
                let oldTag = await Tag.selectId(id);
                if (name != oldTag.name) {
                    let tagNameExists = await Tag.hasName(name);
                    if (tagNameExists) {
                        return res.status(400).json({
                            message: 'Tên tag đã bị trùng'
                        });
                    }
                }

                let logoPath = '';
                if (req.files && req.files.logo) {
                    // Up logo mới
                    let logoId = await MyDrive.uploadImage(req.files.logo, name);

                    // Xóa logo cũ
                    let oldLogoId = MyDrive.getImageId(oldTag.logo);
                    await MyDrive.deleteFiles(oldLogoId);

                    logoPath = "https://drive.google.com/uc?export=view&id=" + logoId;
                }

                let result = await Tag.update(id, name, logoPath);

                res.status(200).json({
                    message: 'Cập nhật thẻ thành công',
                    data: result
                })
            } else {
                res.status(400).json({
                    message: 'Tên tag không được bỏ trống'
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
 * Xóa thẻ theo id
 * @params      id
 * @permisson   Admin
 * @return      200: Xóa thành công
 *              403: Thẻ đã có bài viết nên không thể xóa
 *              404: Không tìm thấy thẻ để sửa
 */
router.delete('/:id', Auth.authenAdmin, async (req, res, next) => {
    try {
        let id = req.params.id;
        let tagExists = await Tag.has(id);

        if (tagExists) {
            let countPostsOfTag = await Tag.countPostsOfTag(id);
            if (countPostsOfTag > 0) {
                return res.status(403).json({
                    message: 'Thẻ đã có bài viết nên không thể xóa'
                })
            } else {
                let tag = await Tag.selectId(id);
                let tagLogoId = MyDrive.getImageId(tag.logo);
                await MyDrive.deleteFiles(tagLogoId);

                let deleteTag = await Tag.delete(id);
                return res.status(200).json({
                    message: 'Xóa thẻ thành công'
                })
            }
        } else {
            return res.status(404).json({
                message: 'Không tìm thấy tag để xóa'
            })
        }

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Lấy danh sách bài viết thuộc thẻ có id theo trang
 * @params      id tag
 * @query       page
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