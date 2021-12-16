const express = require('express');
const router = express.Router();

var Auth = require('../../../auth');
var Post = require('../module/post');
var Account = require('../module/account');
var Comment = require('../module/comment');


/**
 * Bình luận trên 1 bài đăng
 * @body        content
 * @permisson   Những người có tài khoản
 *              Không dùng cho tài khoản bị khóa
 * @return      200: Bình luận thành công, trả về thông tin bình luận và tài khoản người bình luận
 *              400: Thiếu bình luận
 *              403: Tài khoản đã bị khóa
 *              404: Không tìm thấy bài post đó
 */
router.post('/:id_post/comment', Auth.authenGTUser, async (req, res, next) => {
    try {
        let content = req.body.content;
        content = content.trim();
        let id_post = req.params.id_post;
        let acc = await Account.selectId(Auth.tokenData(req).id_account);

        // Tài khoản bị khóa
        if (acc.account_status != 0) {
            return res.status(403).json({
                message: 'Tài khoản đã bị khóa, không thể bình luận'
            })
        }

        let existPost = await Post.has(id_post);
        if (!existPost) {
            return res.status(404).json({
                message: 'Không tìm thấy post',
            })
        }

        if (content != "") {
            let create = await Comment.addComment(acc.id_account, id_post, content);
            let change = await Comment.changeParent(create);
            change = await Comment.selectId(change.id_cmt);
            return res.status(200).json({
                message: 'comment thành công',
                data: change,
            })
        } else {
            return res.status(400).json({
                message: 'thiếu dữ liệu'
            })
        }

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Xem tất cả bình luận (hiện)
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      200: Yêu cầu thành công, trả về 1 list comment gồm :id_account, real_name, avatar, id_comment, content, date_time, id_cmt_parent
 *              404: Bài viết không tồn tại
 */
router.get('/:id_post/comment', async (req, res, next) => {
    try {
        let idPost = req.params.id_post;
        let existPost = await Post.has(idPost);

        if (!existPost) {
            return res.status(404).json({
                message: 'Không tìm thấy post'
            })
        }

        let list = await Comment.listCommentInPost(idPost);
        res.status(200).json({
            message: 'list comment thành công',
            data: list
        })

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Xem tất cả bình luận chính (hiện)
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      200: Yêu cầu thành công, trả về 1 list comment gồm :id_account, real_name, avatar, id_comment, content, date_time, id_cmt_parent
 *              404: Bài viết không tồn tại
 */
router.get('/:id_post/comment/main', async (req, res, next) => {
    try {
        let idPost = req.params.id_post;
        let existPost = await Post.has(idPost);

        if (!existPost) {
            return res.status(404).json({
                message: 'Không tìm thấy post'
            })
        }

        let list = await Comment.listMainCommentInPost(idPost);
        res.status(200).json({
            message: 'list comment thành công',
            data: list
        })

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Xem tất cả bình luận phản hồi của 1 bình luận chính (hiện)
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      200: Yêu cầu thành công, trả về 1 list comment gồm :id_account, real_name, avatar, id_comment, content, date_time, id_cmt_parent
 *              404: Không thấy bình luận chính
 */
router.get('/:id_post/comment/reply/:id_cmt_parent', async (req, res, next) => {
    try {
        let idParent = id_cmt_parent;
        let existParent = await Image.has(idParent);

        if (!existParent) {
            return res.status(404).json({
                message: 'Không tìm thấy bình luận chính'
            })
        }

        let list = await Comment.listReplyInComment(idParent);
        res.status(200).json({
            message: 'list comment thành công',
            data: list
        })

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Xem tất cả bình luận kể cả ẩn
 * 
 * @permisson   Người đăng bài
 *              Người có tài khoản Mor trở lên
 * @return      200: Yêu cầu thực hiện, trả về 1 list comment gồm :id_account, real_name, avatar, id_comment, content, date_time, id_cmt_parent, status
 *              401: Tài khoản không có quyền thực hiện
 *              404: Không tìm thấy bài viết
 */
router.get('/:id_post/comment/all', Auth.authenGTUser, async (req, res, next) => {
    try {
        let idPost = req.params.id_post;
        let existPost = await Post.has(idPost);
        let poster = await Post.selectAccountPostId(idPost);
        let acc = await Account.selectId(Auth.tokenData(req).id_account);

        if (!existPost) {
            return res.status(404).json({
                message: 'Không tìm thấy post'
            });
        }

        if (acc.id_account !== poster.id_account) {
            if (acc.id_role < 1 || acc.id_role > 2)
                return res.status(401).json({
                    message: 'Bạn không có quyền xem'
                });
        }

        let list = await Comment.listCommentInPost(idPost);
        return res.status(200).json({
            message: 'list comment thành công',
            data: list
        });

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

/**
 * Trả lời của 1 comment chính
 * @body        content
 * @permisson   Người có tài khoản
 *              Người không bị khóa mõm
 * @return      200: Tạo thành công, trả thông tin bình luận và thông tin người bình luận
 *              400: Không có ký tự trong bình luân
 *              401: Bình luận cha không nằm trong bài viết này
 *              404: Không tìm thấy bình luận cha
 *              
 */
router.post('/:id_post/comment/:id_cmt_parent/reply', Auth.authenGTUser, async (req, res, next) => {
    try {
        let idPost = req.params.id_post;
        let idParent = req.params.id_cmt_parent;
        let content = req.body.content;
        content = content.trim();
        let acc = await Account.selectId(Auth.tokenData(req).id_account);

        // Tài khoản bị khóa
        if (acc.account_status != 0) {
            return res.status(403).json({
                message: 'Tài khoản đã bị khóa, không thể bình luận'
            });
        }

        let existCmt = await Comment.has(idParent);
        let idPostOfCmt = await Comment.selectPostComment(idParent)

        if (!existCmt) {
            return res.status(404).json({
                message: 'Không tìm thấy comment cũ',
            });
        }

        if (idPostOfCmt.id_post != idPost) {
            return res.status(401).json({
                message: 'bài đăng và bình luận không khớp',
            });
        }

        if (content) {
            let create = await Comment.addCommentWithParent(acc.id_account, idPost, idParent, content);
            let data = await Comment.selectId(create.id_cmt);
            res.status(200).json({
                message: 'tạo comment thành công',
                data: data
            });
        } else {
            req.status(400).json({
                message: 'Không có dữ liệu'
            });
        }

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

/**
 * Thay đổi bình luận
 * @body        content
 * @permisson   Người đăng bình luận
 * @return      200: Sửa bình luận thành công
 *              400: Thiếu thông tin đăng ký
 *              401: Không có quyền sửa bình luận của người khác
 *              404: Không tìm thấy bài đăng hoặc bình luận
 */
router.put('/:id_post/comment/:id_cmt/update', Auth.authenGTUser, async (req, res, next) => {
    try {
        let acc = await Account.selectId(Auth.tokenData(req).id_account);
        let idPost = req.params.id_post;
        let idCmt = req.params.id_cmt;
        let content = req.body.content;
        content = content.trim();

        if (acc.account_status != 0) {
            return res.status(403).json({
                message: 'Tài khoản đã bị khóa, không thể chỉnh sửa bình luận'
            });
        }

        let existCmt = await Comment.has(idCmt);
        let existPost = await Post.has(idPost);
        let id_commenter = await Comment.selectAccountComment(idCmt);
        if (!existPost) {
            return res.status(404).json({
                message: 'Không tìm thấy post'
            });
        }

        if (!existCmt) {
            return res.status(404).json({
                message: 'Không tìm thấy comment cũ'
            });
        }

        if (acc.id_account === id_commenter.id_account) {
            if (content) {
                let update = await Comment.updateComment(idCmt, content);
                update = await Comment.selectId(idCmt);
                return res.status(200).json({
                    message: 'Thay đôi thành công',
                    data: update
                });
            } else {
                res.status(400).json({
                    message: "Không có dữ liệu"
                });
            }
        } else {
            return res.status(401).json({
                message: "Không phải chính chủ, không được đổi cmt",
            });
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

/**
 * Xóa bình luận cũ
 * 
 * @permisson   Người bình luận hoặc, admin
 *              Không áp dụng cho tài khoản bị khóa
 * @return      200: Xóa thành công
 *              401: Không có quyền xóa bình luận
 *              403: Tài khoản này bị khóa
 *              404: Không tìm thấy post hoặc bình luận
 */
router.delete('/:id_post/comment/:id_cmt/delete', Auth.authenGTUser, async (req, res, next) => {
    try {
        let acc = await Account.selectId(Auth.tokenData(req).id_account);
        let idCmt = req.params.id_cmt;
        if (acc.account_status != 0) {
            return res.status(403).json({
                message: 'Tài khoản đã bị khóa, không thể xóa bình luận'
            });
        }

        let existCmt = await Comment.has(idCmt);
        let commenter = await Comment.selectAccountComment(idCmt);

        if (!existCmt) {
            return res.status(404).json({
                message: 'Không tìm thấy comment cũ'
            });
        }

        if (acc.id_account === commenter.id_account || acc.id_role == 1) {
            Comment.delete(idCmt);
            Comment.deleteParent(idCmt);
            return res.status(200).json({
                message: 'Xóa thành công'
            });
        } else {
            return res.status(401).json({
                message: "Bạn không có quyển xóa bình luận này"
            });
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

/**
 * Ẩn hoặc hủy ẩn bình luận
 *      0: nhìn thấy bình luận
 *      1: Ẩn bình luận
 * 
 * @permisson   Người chủ bài viết
 *              Người mor
 *              Tài khoản phải không bị khóa
 * @return      200: Thay đổi thành công, trả về bài viết
 *              400: Trạng thái (new_status) khác 0 và 1
 *              401: Tài khoản không có quyền thực hiện
 *              404: Không tìm thấy post hoặc bình luận
 */
router.put('/:id_post/comment/:id_cmt/status/:new_status', Auth.authenGTUser, async (req, res, next) => {
    try {
        let idCmt = req.params.id_cmt;
        let newStatus = req.params.new_status;
        let acc = await Account.selectId(Auth.tokenData(req).id_account);
        let isCommenter = await Comment.has(idCmt);
        let idPost = await Comment.selectPostComment(idCmt);
        idPost = idPost.id_post;
        let poster = await Post.selectAccountPostId(idPost);

        if (!isCommenter) {
            return res.status(404).json({
                message: 'Không tìm thấy comment này'
            });
        }

        if (acc !== poster.id_account) {
            if (acc.id_role != 1) {
                return res.status(401).json({
                    message: 'Bạn không có quyền này'
                });
            }
        }

        if (newStatus) {
            if (newStatus != 0 && newStatus != 1) {
                return res.status(400).json({
                    message: 'Trạng thái không hợp lệ'
                });
            }

            else {
                let change = await Comment.changeStatus(idCmt, newStatus);
                change = await Comment.selectId(idCmt);
                return res.status(200).json({
                    message: 'Thay đổi thành công',
                    data: change
                });
            }
        }

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});


module.exports = router;