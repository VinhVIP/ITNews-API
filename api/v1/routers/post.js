const e = require('express');
const express = require('express');
const router = express.Router();

var Auth = require('../../../auth');
var Post = require('../module/post');
var Tag = require('../module/tag');
var Account = require('../module/account');


/**
 * Lấy tất cả các bài viết NHÁP của bản thân
 * 
 * @permission  Đăng nhập mới được thực hiện
 * @return      200: Thành công, trả về danh sách bài viết
 */
 router.get('/drafts', Auth.authenGTUser, async (req, res, next) => {
    try {
        let accId = Auth.tokenData(req).id_account;
        let postsId = await Post.getDraftPosts(accId);
        let data = [];
        for (let i = 0; i < postsId.length; i++) {
            let post = await Post.selectId(postsId[i].id_post);
            data.push({
                post: post.data.post,
                tags: post.data.tags
            });
        }

        res.status(200).json({
            message: 'Lấy danh sách bài viết nháp thành công',
            data: data
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Lấy tất cả các bài viết PUBLIC của bản thân
 * 
 * @permission  Đăng nhập mới được thực hiện
 * @return      200: Thành công, trả về danh sách bài viết
 */
 router.get('/public', Auth.authenGTUser, async (req, res, next) => {
    try {
        let accId = Auth.tokenData(req).id_account;
        let postsId = await Post.getPublicPosts(accId);
        let data = [];
        for (let i = 0; i < postsId.length; i++) {
            let post = await Post.selectId(postsId[i].id_post);
            data.push({
                post: post.data.post,
                tags: post.data.tags
            });
        }

        res.status(200).json({
            message: 'Lấy danh sách bài viết nháp thành công',
            data: data
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})


/**
 * Lấy tất cả các bài viết UNLISTED của bản thân
 * 
 * @permission  Đăng nhập mới được thực hiện
 * @return      200: Thành công, trả về danh sách bài viết
 */
 router.get('/unlisted', Auth.authenGTUser, async (req, res, next) => {
    try {
        let accId = Auth.tokenData(req).id_account;
        let postsId = await Post.getUnlistedPosts(accId);
        let data = [];
        for (let i = 0; i < postsId.length; i++) {
            let post = await Post.selectId(postsId[i].id_post);
            data.push({
                post: post.data.post,
                tags: post.data.tags
            });
        }

        res.status(200).json({
            message: 'Lấy danh sách bài viết nháp thành công',
            data: data
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Lấy 1 bài viết theo id
 * 
 * @permission  Ai cũng có thể thực thi
 * @return      200: Thành công, trả về bài viết + các tags của bài viết
 *              404: Không tìm thấy bài viết  
 */
router.get('/:id', async (req, res, next) => {
    try {
        let id = req.params.id;

        let result = await Post.selectId(id);
        if (result.status) {
            res.status(200).json({
                message: 'Lấy bài viết thành công',
                data: result.data
            })
        } else {
            res.status(404).json({
                message: 'Không tìm thấy bài viết'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Thêm bài viết mới
 * 
 * @permisson   Chỉ User trở lên mới được thi thi
 *              Tài khoản bị khóa không thể tạo bài viết
 * @return      201: Tạo bài viết thành công, trả về bài viết vừa tạo
 *              400: Thiếu dữ liệu
 *              403: Tài khoản bị khóa, không thể tạo bài viết
 *              404: Thẻ thuộc bài viết không hợp lệ
 */
router.post('/', Auth.authenGTUser, async (req, res, next) => {
    try {
        let { title, content, tags } = req.body;
        let acc = await Account.selectId(Auth.tokenData(req).id_account);

        // Tài khoản bị khóa
        if (acc.status != 0) {
            return res.status(403).json({
                message: 'Tài khoản đã bị khóa, không thể viết bài'
            })
        }

        if (title && content && tags) {
            // Loại bỏ các thẻ trùng lặp (nếu có)
            tags = [...new Set(tags)];

            if (tags.length < 1 || tags.length > 5) {
                return res.status(400).json({
                    message: 'Số lượng thẻ chỉ từ 1 đến 5'
                })
            }

            // Kiểm tra tag có hợp lệ hay không
            for (let id_tag of tags) {
                let tagExists = await Tag.has(id_tag);
                if (!tagExists) {
                    return res.status(404).json({
                        message: 'Thẻ không hợp lệ'
                    })
                }
            }

            // Thêm bài viết
            let postResult = await Post.addPost(acc.id_account, req.body);

            let idPostInsert = postResult.id_post;

            // Thêm các liên kết tag-post
            for (let id_tag of tags) {
                await Post.addPostTag(idPostInsert, id_tag);
            }

            res.status(201).json({
                message: 'Tạo bài viết thành công',
                data: {
                    post: postResult,
                    tags: tags
                }
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
 * Chỉnh sửa bài viết theo id
 * 
 * @permission  Chỉ người viết bài mới được sửa
 * @return      200: Cập nhật thành công
 *              400: Thiếu dữ liệu
 *              403: Không thể sửa bài viết của người khác
 *              404: Bài viết hoặc thẻ thuộc bài viết không hợp lệ
 */
router.put('/:id', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_post = req.params.id;

        let acc = await Account.selectId(Auth.tokenData(req).id_account);
        let post = await Post.selectId(id_post);

        if (post.status) {
            // Người viết mới được sửa
            if (post.data.post.id_account === acc.id_account) {
                let { title, content, access, tags } = req.body;

                if (title && content && access, tags) {
                    tags = [...new Set(tags)];

                    if (tags.length < 1 || tags.length > 5) {
                        return res.status(400).json({
                            message: 'Số lượng thẻ chỉ từ 1 đến 5'
                        })
                    }

                    // Kiểm tra tag có hợp lệ hay không
                    for (let id_tag of tags) {
                        let tagExists = await Tag.has(id_tag);
                        if (!tagExists) {
                            return res.status(404).json({
                                message: 'Thẻ không hợp lệ'
                            })
                        }
                    }

                    // Khi mọi thứ OK để có thể update

                    // Xóa những post_tag cũ
                    await Post.deletePostTag(id_post);

                    // Thêm lại những tag mới
                    for (let id_tag of tags) {
                        await Post.addPostTag(id_post, id_tag);
                    }

                    // Cập nhật lại bài viết
                    let result = await Post.update(id_post, req.body);

                    res.status(200).json({
                        message: 'Cập nhật bài viết thành công',
                    })

                } else {
                    res.status(400).json({
                        message: 'Thiếu dữ liệu'
                    })
                }
            } else {
                res.status(403).json({
                    message: 'Không thể sửa bài viết của người khác'
                })
            }
        } else {
            res.status(404).json({
                message: 'Không tìm thấy bài viết để sửa'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Xóa bài viết theo id
 * 
 * @permission  Chỉ người viết mới được xóa bài
 * @return      200: Xóa thành công
 *              401: Không thể xóa bài viết của người khác
 *              404: Không tìm thấy bài viết để xóa
 */
router.delete('/:id', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id = req.params.id;
        let accUser = await Account.selectId(Auth.tokenData(req).id_account);

        let postExists = await Post.has(id);
        if (postExists) {
            // Chỉ người viết hoặc Admin mới được xóa bài
            // TODO: Chưa làm admin
            let checkAuthor = await Post.checkPostAuthor(id, accUser.id_account);
            if (checkAuthor) {
                await Post.deletePost(id);
                res.status(200).json({
                    message: 'Xóa bài viết thành công'
                })
            } else {
                res.status(401).json({
                    message: 'Không thể xóa bài viết của người khác'
                })
            }
        } else {
            res.status(404).json({
                message: 'Không tìm thấy bài viết để xóa'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Thay đổi trạng thái (status) của bài viết
 *      0: Chờ kiểm duyệt
 *      1: Đã kiểm duyệt
 *      2: Spam
 * @permission  Chỉ Moder trở lên 
 * @return      200: Thành công
 *              400: Trạng thái mới không hợp lệ
 *              404: Không tìm thấy bài viết để update
 */
router.put('/:id/status/:status_new', Auth.authenGTModer, async (req, res, next) => {
    try {
        let { id, status_new } = req.params;

        // Kiểm tra giá trị trạng thái
        if (status_new < 0 || status_new > 2) {
            return res.status(400).json({
                message: 'Trạng thái mới không hợp lệ'
            })
        }

        // Kiểm tra bài viết có tồn tại hay không
        let postExists = await Post.has(id);

        if (postExists) {
            let result = await Post.changeStatus(id, status_new);

            res.status(200).json({
                message: 'Cập nhật trạng thái bài viết thành công',
            })
        } else {
            res.status(404).json({
                message: 'Không tìm thấy bài viết này'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Thay đổi chế độ truy cập của bài viết (access)
 *      0: Nháp 
 *      1: Công khai
 *      2: Chỉ có link mới xem được
 * @permission  Người viết bài mới được thay đổi
 * @return      200: Thành công
 *              403: Không thể thay đổi bài viết của người khác
 *              404: Không tìm thấy bài viết để update
 */
router.put('/:id/access/:access_new', Auth.authenGTUser, async (req, res, next) => {
    try {
        let { id, access_new } = req.params;

        // Kiểm tra bài viết có tồn tại hay không
        let postExists = await Post.has(id);

        if (postExists) {
            let accId = Auth.tokenData(req).id_account;
            let accPostId = await Post.selectAccountPostId(id);

            if (accId === accPostId.id_account) {
                // Kiểm tra giá trị access
                if (access_new < 0 || access_new > 2) {
                    return res.status(400).json({
                        message: 'Trạng thái mới không hợp lệ'
                    })
                }

                let result = await Post.changeAccess(id, access_new);

                res.status(200).json({
                    message: 'Cập nhật chế độ truy cập bài viết thành công',
                })
            } else {
                res.status(403).json({
                    message: 'Không thể thay đổi access bài viết của người khác'
                })
            }
        } else {
            res.status(404).json({
                message: 'Không tìm thấy bài viết này'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Lấy các bài viết public mới nhất theo trang
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      200: Thành công, trả về các bài viết thuộc trang
 */
router.get('/page/:page', async (req, res, next) => {
    try {
        let page = req.params.page;
        let postsId = await Post.getNewestPage(page);
        let data = [];
        for (let i = 0; i < postsId.length; i++) {
            let post = await Post.selectId(postsId[i].id_post);
            data.push({
                post: post.data.post,
                tags: post.data.tags
            });
        }

        res.status(200).json({
            message: `Lấy danh sách bài viết thuộc trang ${page} thành công`,
            data: data
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})



module.exports = router;