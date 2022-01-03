const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

var Auth = require('../../../auth');
var Post = require('../module/post');
var Tag = require('../module/tag');
var Account = require('../module/account');
var Vote = require('../module/vote');
var Notification = require('../module/notification');
var FollowAccount = require('../module/follow_account');


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
            let tags = await Post.selectTagsOfPost(postsId[i].id_post);
            data.push({
                post: post,
                tags: tags

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
            let tags = await Post.selectTagsOfPost(postsId[i].id_post);
            data.push({
                post: post,
                tags: tags

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
            let tags = await Post.selectTagsOfPost(postsId[i].id_post);
            data.push({
                post: post,
                tags: tags

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
 * Lấy các bài viết công khai, chưa kiểm duyệt
 * 
 * @permission  Moder trở lên (xem để kiểm duyệt)
 * @return      200: Thành công. trả về danh sách bài viết
 */
router.get('/browse', Auth.authenGTModer, async (req, res, next) => {
    try {
        let postsId = await Post.getPostsForBrowse();

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
            message: `Lấy danh sách bài viết thành công thành công`,
            data: data
        })

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})


/**
 * Lấy TẤT CẢ các bài viết public mới nhất 
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      200: Thành công, trả về các bài viết thuộc trang
 */
router.get('/newest/all', async (req, res, next) => {
    try {
        let postsId = await Post.getAllNewest();

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
            message: `Lấy danh sách tất cả bài viết mới thuộc thành công`,
            data: data
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Tìm kiếm bài viết theo từ khóa
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      200: Thành công, trả về các bài viết 
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

        let postsId = await Post.getSearch(k);

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
            message: `Lấy danh sách bài viết tìm kiếm thành công`,
            data: data
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Lấy các bài viết public mới nhất
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      200: Thành công, trả về các bài viết thuộc trang
 */
router.get('/newest', async (req, res, next) => {
    try {
        let page = req.query.page;
        let postsId;

        if (page) postsId = await Post.getNewest(page);
        else postsId = await Post.getNewest();

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
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Lấy các bài viết theo thứ tự rating cao -> thấp
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      200: Thành công, trả về các bài viết thuộc trang
 */
router.get('/trending', async (req, res, next) => {
    try {
        let postsId = await Post.getTrending();

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
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})


/**
 * Lấy các bài viết thuộc tag follow và tài khoản follow mới nhất
 * 
 * @permisson   Đăng nhập mới được thực thi
 * @return      200: Thành công, trả về các bài viết thuộc trang
 */
router.get('/following', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let postsId = await Post.getFollowing(id_account);

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
 *              403: Không có quyền xem bài viết
 *              404: Không tìm thấy bài viết  
 */
router.get('/:id', async (req, res, next) => {
    try {
        const authorizationHeader = req.headers['authorization'];

        let id = req.params.id;

        let postExists = await Post.has(id);
        if (postExists) {
            let post;
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
                post = await Post.selectIdForUser(id, idUser);
            } else {
                post = await Post.selectId(id);
            }

            let author = await Account.selectId(post.id_account);
            let tags = await Post.selectTagsOfPost(id);

            let visitor = Auth.tokenData(req);
            if (visitor == null) {
                console.log("guest");
                if (post.status === 1 && post.access !== 0) {
                    // Những bài viết [đã kiểm duyệt] && [công khai || có link]
                    let curView = (await Post.getView(id)).view;
                    await Post.updateView(id, curView + 1);

                    post.view++;

                    res.status(200).json({
                        message: 'Lấy bài viết thành công',
                        data: {
                            post: post,
                            author: author,
                            tags: tags
                        }
                    })
                } else {
                    return res.status(403).json({
                        message: 'Bạn không có quyền truy cập'
                    })
                }
            } else {
                let user = await Account.selectId(visitor.id_account);
                if (user.id_role <= 2 || user.id_account === post.id_account) {
                    // Moder trở lên hoặc chính tác giả
                    // Hoặc bài viết là công khai
                    // Không tính view

                    return res.status(200).json({
                        message: 'Lấy bài viết thành công',
                        data: {
                            post: post,
                            author: author,
                            tags: tags
                        }
                    })
                } else if (post.status === 1 && post.access !== 0) {
                    let curView = (await Post.getView(id)).view;
                    await Post.updateView(id, curView + 1);

                    post.view++;

                    return res.status(200).json({
                        message: 'Lấy bài viết thành công',
                        data: {
                            post: post,
                            author: author,
                            tags: tags
                        }
                    })
                } else {
                    return res.status(403).json({
                        message: 'Bạn không có quyền truy cập'
                    })
                }
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
 * Lấy 1 bài viết theo id
 * 
 * @permission  Ai cũng có thể thực thi
 * @return      200: Thành công, trả về bài viết + các tags của bài viết
 *              403: Không có quyền xem bài viết
 *              404: Không tìm thấy bài viết  
 */
router.get('/:id/user', Auth.authenGTUser, async (req, res, next) => {
    try {
        let idUser = Auth.tokenData(req).id_account;
        let id = req.params.id;

        let postExists = await Post.has(id);
        if (postExists) {
            let post = await Post.selectIdForUser(id, idUser);
            let author = await Account.selectId(post.id_account);
            let tags = await Post.selectTagsOfPost(id);

            let visitor = Auth.tokenData(req);
            if (visitor == null) {
                console.log("guest");
                if (post.status === 1 && post.access !== 0) {
                    // Những bài viết [đã kiểm duyệt] && [công khai || có link]
                    let curView = (await Post.getView(id)).view;
                    await Post.updateView(id, curView + 1);

                    post.view++;

                    res.status(200).json({
                        message: 'Lấy bài viết thành công',
                        data: {
                            post: post,
                            author: author,
                            tags: tags
                        }
                    })
                } else {
                    return res.status(403).json({
                        message: 'Bạn không có quyền truy cập'
                    })
                }
            } else {
                let user = await Account.selectId(visitor.id_account);
                if (user.id_role <= 2 || user.id_account === post.id_account) {
                    // Moder trở lên hoặc chính tác giả
                    // Hoặc bài viết là công khai
                    // Không tính view

                    return res.status(200).json({
                        message: 'Lấy bài viết thành công',
                        data: {
                            post: post,
                            author: author,
                            tags: tags
                        }
                    })
                } else if (post.status === 1 && post.access !== 0) {
                    let curView = (await Post.getView(id)).view;
                    await Post.updateView(id, curView + 1);

                    post.view++;

                    return res.status(200).json({
                        message: 'Lấy bài viết thành công',
                        data: {
                            post: post,
                            author: author,
                            tags: tags
                        }
                    })
                } else {
                    return res.status(403).json({
                        message: 'Bạn không có quyền truy cập'
                    })
                }
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
        let { title, content, tags, access } = req.body;
        let acc = await Account.selectId(Auth.tokenData(req).id_account);

        // Tài khoản bị khóa
        if (acc.account_status != 0) {
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
 *              Tài khoản bị khóa không thẻ sửa bài
 * @return      200: Cập nhật thành công
 *              400: Thiếu dữ liệu
 *              403: Không thể sửa bài viết của người khác
 *              404: Bài viết hoặc thẻ thuộc bài viết không hợp lệ
 */
router.put('/:id', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_post = req.params.id;

        let acc = await Account.selectId(Auth.tokenData(req).id_account);

        // Tài khoản bị khóa
        if (acc.account_status != 0) {
            return res.status(403).json({
                message: 'Tài khoản đã bị khóa, không thể sửa bài'
            })
        }

        let postExists = await Post.has(id_post);
        if (postExists) {
            let post = await Post.selectId(id_post);
            // Người viết mới được sửa
            if (post.id_account === acc.id_account) {
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
 *              Tài khoản bị khóa không thể xóa bài
 * @return      200: Xóa thành công
 *              401: Không thể xóa bài viết của người khác
 *              404: Không tìm thấy bài viết để xóa
 */
router.delete('/:id', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id = req.params.id;
        let acc = await Account.selectId(Auth.tokenData(req).id_account);

        // Tài khoản bị khóa
        if (acc.account_status != 0) {
            return res.status(403).json({
                message: 'Tài khoản đã bị khóa, không thể xóa bài'
            })
        }

        let postExists = await Post.has(id);
        if (postExists) {
            // Chỉ người viết hoặc Admin mới được xóa bài
            let checkAuthor = await Post.checkPostAuthor(id, acc.id_account);
            if (checkAuthor || acc.id_role == 0) {
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
            let isPublic = await Post.isPublic(id);

            if (status_new == 1 && isPublic) {
                let poster = await Post.selectId(id);
                let author = await Account.selectId(poster.id_account);
                let name = author.real_name;
                let id_followers = await FollowAccount.listFollowingOf(poster.id_account);
                for (let id_follower of id_followers) {
                    Notification.addNotification(id_follower.id_following, `${name} đã đăng một bài viết mới`, `/post/${id}`)
                }
            }

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
 * Lấy số lượng và danh sách UP VOTE của bài viết
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      200: Thành công, trả về số lượng và dữ liệu vote
 *              404: Bài viết không tồn tại
 */
router.get('/:id/voteup', async (req, res, next) => {
    try {
        let id = req.params.id;
        let postExists = await Post.has(id);
        if (postExists) {
            let result = await Vote.getUpVotes(id);
            res.status(200).json({
                message: 'Lấy danh sách vote up thành công',
                data: {
                    total: result.length,
                    vote: result
                }
            })
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
 * Lấy số lượng và danh sách DOWN VOTE của bài viết
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      200: Thành công, trả về số lượng và dữ liệu vote
 *              404: Bài viết không tồn tại
 */
router.get('/:id/votedown', async (req, res, next) => {
    try {
        let id = req.params.id;
        let postExists = await Post.has(id);
        if (postExists) {
            let result = await Vote.getDownVotes(id);
            res.status(200).json({
                message: 'Lấy danh sách vote down thành công',
                data: {
                    total: result.length,
                    vote: result
                }
            })
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
 * Trả về điểm vote của bài viết: mark = up - down
 * 
 * @permission  Ai cũng có thể thực thi
 * @return      200: Thành công, trả về điểm
 *              404: Bài viết không tồn tại
 */
router.get('/:id/vote', async (req, res, next) => {
    try {
        let id = req.params.id;
        let postExists = await Post.has(id);
        if (postExists) {
            let voteUp = await Vote.getUpVotes(id);
            let voteDown = await Vote.getDownVotes(id);
            res.status(200).json({
                message: 'Lấy điểm vote thành công',
                data: voteUp.length - voteDown.length
            })
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
 * Lấy các bài viết theo status
 * 
 * @permission  Moder trở lên 
 * @return      200: Thành công. trả về danh sách bài viết
 *              400: Giá trị status không hợp lệ
 */
router.get('/status/:status', Auth.authenGTModer, async (req, res, next) => {
    try {
        let { status } = req.params;
        if (status >= 0 || status <= 2) {
            let postsId = await Post.getPostsByStatus(status);

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
                message: `Lấy danh sách bài viết thành công thành công`,
                data: data
            })
        } else {
            res.status(400).json({
                message: 'Giá trị trạng thái không hợp lệ'
            })
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

module.exports = router;