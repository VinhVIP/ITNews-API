const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const Account = require('../module/account');
const Role = require('../module/role');
const Post = require('../module/post');
const Bookmark = require('../module/bookmark');
const FollowTag = require('../module/follow_tag');
const FollowAccount = require('../module/follow_account');
const Vote = require('../module/vote');

var Auth = require('../../../auth');

router.post('/login', async (req, res, next) => {
    // Authorization
    if (req.body.account_name && req.body.password) {
        let result = await Account.checkAccount(req.body);

        if (result.status) {
            var data = {
                "id_account": result.data.id_account,
                "id_role": result.data.id_role,
                "account_name": result.data.account_name,
                "status": result.data.status
            }

            const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '3600s'
            });

            res.status(200).json({
                message: 'Đăng nhập thành công',
                accessToken
            });
        } else {
            res.status(404).json({
                message: 'Thông tin đăng nhập sai'
            })
        }
    } else {
        res.status(400).json({
            message: 'Thiếu thông tin đăng nhập'
        })
    }
})

/**
 * Lấy danh sách tất cả tài khoản
 * 
 * @permission Chỉ Moder trở lên mới được thực thi
 */
router.get('/all', Auth.authenGTModer, async (req, res, next) => {
    var list = await Account.selectAll();

    res.status(200).json({
        message: 'Account ok',
        data: list
    });
});


/**
 * Lấy thông tin 1 tài khoản theo id
 * 
 * @permission  Ai cũng có thể thực thi
 * 
 * @return      200: trả về tài khoản tìm thấy
 *              404: Không tìm thấy
 */
router.get('/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        let accountExists = await Account.has(id);

        if (accountExists) {
            let result = await Account.selectId(id);

            res.status(200).json({
                message: 'Đã tìm thấy tài khoản',
                data: result
            })
        } else {
            res.status(404).json({
                message: 'Không tìm thây tài khoản',
            })
        }

    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: 'Something wrong!'
        })
    }
})

/**
 * Lấy thông tin chức vụ của 1 tài khoản theo id
 * 
 * @permission  Ai cũng có thể thực thi
 * 
 * @return      200: trả về chức vụ của tài khoản cần tìm
 *              404: Không tìm thấy tìm khoản 
 */
router.get('/:id/role', async (req, res, next) => {
    try {
        let accountExists = await Account.has(id);

        if (accountExists) {
            let result = await Account.selectRole(req.params.id);
            res.status(200).json({
                message: 'OK',
                data: result
            })
        } else {
            res.status(404).json({
                message: 'Tài khoản không tồn tại'
            })
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: 'Something wrong'
        })
    }
})


/**
 * Thêm 1 tài khoản mới (đăng ký)
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      201: Tạo thành công, trả về id vừa được thêm
 *              400: Thiếu thông tin đăng ký
 */
router.post('/', async (req, res, next) => {
    try {
        var { account_name, real_name, email, password } = req.body;


        if (account_name && real_name && email && password) {
            let id_role = req.body.id_role ?? 3;
            let acc = { account_name, real_name, email, password, id_role };

            let insertId = await Account.add(acc);

            res.status(201).json({
                message: 'Tạo mới tài khoản thành công',
                data: {
                    id: insertId
                }
            })
        } else {
            res.status(400).json({
                message: 'Thiếu dữ liệu để tạo tài khoản'
            })
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: 'Something wrong'
        })
    }

});

/**
 * Thay đổi thông tin tài khoản, chỉ có thể đổi của chính bản thân
 * 
 * @permission  phải đăng nhập thì mới được thực thi (user trở lên)
 * @return      401: Không được sửa thông tin của người khác
 *              400: Thiếu thông tin bắt buộc
 *              200: Cập nhật thành công, trả về tài khoản vừa cập nhật
 */
router.put('/:id', Auth.authenGTUser, async (req, res, next) => {
    try {
        let updateId = req.params.id;
        let userId = Auth.tokenData(req).id_account;

        if (updateId != userId) {
            return res.status(401).json({
                message: 'Không thể sửa đổi thông tin của người khác'
            })
        }

        if (!req.body.real_name) {
            res.status(400).json({
                message: 'real_name là bắt buộc'
            })
        }

        var account = {
            'real_name': req.body.real_name ?? '',
            'birth': req.body.birth ?? '',
            'gender': req.body.gender ?? 0,
            'company': req.body.company ?? '',
            'phone': req.body.phone ?? '',
            'avatar': req.body.avatar ?? '',
        }

        let result = await Account.update(updateId, account);

        res.status(200).json({
            message: 'Cập nhật thông tin tài khoản thành công',
            data: result
        })
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: 'Something wrong'
        })
    }

})

/**
 * Thay đổi chức vụ của tài khoản theo id
 * 
 * @permisson   Moder trở lên mới được thực thi
 *              Người ra lệnh phải có chức vụ cao hơn người được thay đổi
 *              Chức vụ mới nhỏ hơn chức vụ của người ra lệnh
 * 
 * @return      200: Thành công, trả về thông tin tài khoản sau khi cập nhật
 *              400: Giá trị các tham số không chính xác
 *              403: Không đủ quyền thực thi
 */
router.put('/:id/role/:id_role_new', Auth.authenGTModer, async (req, res, next) => {
    try {
        let { id, id_role_new } = req.params;
        let id_boss = Auth.tokenData(req).id_account;

        let boss = await Account.selectRole(id_boss);
        let user = await Account.selectRole(id);

        if (boss.id_role >= user.id_role || id_role_new <= boss.id_role) {
            res.status(403).json({
                message: 'Bạn không có quyền'
            })
        } else {
            // Check chức vụ tồn tại hay không rồi mới được set
            let existsChucVu = await Role.has(id_role_new);

            if (existsChucVu) {
                let result = await Account.updateRole(id, id_role_new);
                res.status(200).json({
                    message: 'Cập nhật chức vụ thành công',
                    data: result
                })
            } else {
                res.status(400).json({
                    message: 'Chức vụ không hợp lệ'
                })
            }

        }


    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: 'Something wrong'
        })
    }
})

// Chưa làm lưu vào bảng khóa tài khoản
/**
 * Thay đổi trạng thái của 1 tài khoản
 *      0: Hoạt động
 *      1: Khóa tạm thời có thời gian (moder trở lên)
 *      2: Khóa vĩnh viễn (chỉ admin)
 * @permission  Moder trở lên mới được phép thực thi
 *              Không thể thay đổi cho chức vụ ngang hàng trở lên
 * @return      200: Thành công, trả về thông tin tài khoản sau khi cập nhật
 *              400: Giá trị trạng thái không hợp lệ
 *              403: Không có quyền thực thi
 */
router.put('/:id/status/:status_new', Auth.authenGTModer, async (req, res, next) => {
    try {
        let { id, status_new } = req.params;

        let id_boss = Auth.tokenData(req).id_account;

        let accBoss = await Account.selectId(id_boss);
        let accUser = await Account.selectId(id);

        if (accBoss.id_role == 2) {
            // MODER
            if (accBoss.id_role >= accUser.id_role || status_new == 2 || accUser.status == 2) {
                res.status(403).json({
                    message: 'Bạn không có quyền thực hiện hành động này'
                })
            } else {
                if (status_new < 0 || status_new >= 3) {
                    res.status(400).json({
                        message: 'Giá trị trạng thái không hợp lệ'
                    })
                } else {
                    let result = await Account.updateStatus(id, status_new);
                    res.status(200).json({
                        message: 'Thay đổi trạng thái của tài khoản thành công',
                        data: result
                    })
                }
            }
        } else if (accBoss.id_role == 1) {
            // ADMIN
            if (status_new < 0 || status_new >= 3) {
                res.status(400).json({
                    message: 'Giá trị trạng thái không hợp lệ'
                })
            } else {
                let result = await Account.updateStatus(id, status_new);
                res.status(200).json({
                    message: 'Thay đổi trạng thái của tài khoản thành công',
                    data: result
                })
            }

        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Something wrong'
        })
    }
})

/**
 * Lấy tất cả bài viết (public, đã kiểm duyệt) của một tài khoản
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      200: Thành công, trả về các bài viết public, đã kiểm duyệt của tài khoản
 */
router.get('/:id/posts', async (req, res, next) => {
    try {
        let idAcc = req.params.id;
        let postsId = await Post.getListPostIdOfAccount(idAcc);
        let data = [];
        for (let i = 0; i < postsId.length; i++) {
            let p = await Post.selectId(postsId[i].id_post);
            data.push({
                post: p.data.post,
                tags: p.data.tags
            });
        }
        res.status(200).json({
            message: 'Lấy danh sách cấc bài viết của tài khoản thành công',
            data: data
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})


/**
 * Lấy danh sách bài viết bookmark của 1 tài khoản
 * 
 * @permission  Đăng nhập mới được thực thi
 * @return      200: Thành công, trả về số lượng + id các bài viết đã bookmark của tài khoản này
 *              404: Tài khoản không tồn tại
 */
router.get('/:id/bookmarks', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id = req.params.id;

        let accExists = await Account.has(id);
        if (accExists) {
            let result = await Bookmark.list(id);
            res.status(200).json({
                message: 'Lấy danh sách bookmark thành công',
                data: result
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


/**
 * Lấy danh sách các thẻ mà tài khoản đang follow
 * 
 * @permission  Ai cũng có thể thực thi
 * @return      200: Thành công, trả về các thẻ đang follow
 *              404: Tài khoản k tồn tại
 */
router.get('/:id/follow_tag', async (req, res, next) => {
    try {
        let id = req.params.id;

        let accExists = await Account.has(id);
        if (accExists) {
            let result = await FollowTag.list(id);

            res.status(200).json({
                message: 'Lấy danh sách các thẻ mà tài khoản theo dõi thành công',
                data: result
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

/**
 * Lấy danh sách tài khoản theo dõi TK có id cho trước
 * 
 * @permission  Ai cũng có thể thực hiện
 * @return      200: Thành công, trả về danh sách tài khoản 
 *              404: Tài khoản không tồn tại
 */
router.get('/:id/following', async (req, res, next) => {
    try {
        let id = req.params.id;

        let accExists = await Account.has(id);
        if (accExists) {
            let result = await FollowAccount.listFollowingOf(id);

            res.status(200).json({
                message: 'Lấy danh sách các tài khoản theo dõi người này thành công',
                data: result
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


/**
 * Lấy danh sách tài khoản mà TK có id cho trước theo dõi
 * 
 * @permission  Ai cũng có thể thực hiện
 * @return      200: Thành công, trả về danh sách tài khoản 
 *              404: Tài khoản không tồn tại
 */
router.get('/:id/follower', async (req, res, next) => {
    try {
        let id = req.params.id;

        let accExists = await Account.has(id);
        if (accExists) {
            let result = await FollowAccount.listFollowerOf(id);

            res.status(200).json({
                message: 'Lấy danh sách các tài khoản mà người này theo dõi thành công',
                data: result
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

/**
 * Lấy điểm vote (mark) của người dùng có id
 *      mark = totalVoteUp - totalVoteDown
 * 
 * @permission  Ai cũng có thể thực thi
 * @return      200: Thành công, trả về {mark, up, down}, mark = up-down
 *              404: Tài khoản không tồn tại
 */
router.get('/:id/mark', async (req, res, next) => {
    try {
        let { id } = req.params;
        let accExists = await Account.has(id);
        if (accExists) {
            let totalUp = await Vote.getTotalVoteUp(id);
            let totalDown = await Vote.getTotalVoteDown(id);

            let mark = totalUp - totalDown;
            res.status(200).json({
                message: 'Lấy tổng điểm thành công',
                data: {
                    mark: mark,
                    up: totalUp,
                    down: totalDown
                }
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

/**
 * Lấy tổng số lượt xem tất cả bài viết mà người dùng đã viết
 * 
 * @permission  Ai cũng có thể thực thi
 * @return      200: Thành công, trả về tổng số lượt xem
 *              404: Tài khoản không tồn tại
 */
router.get('/:id/view', async (req, res, next) => {
    try {
        let { id } = req.params;
        let accExists = await Account.has(id);
        if (accExists) {
            let totalView = (await Post.getTotalView(id)) ?? 0;

            res.status(200).json({
                message: 'Lấy tổng số lượt xem thành công',
                data: parseInt(totalView)
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