const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const myPlaintextPassword = 'K9#4d6z_fT"m,Zy';
const saltRounds = 10;

const router = express.Router();

const Account = require('../module/account');
const Role = require('../module/role');
const Post = require('../module/post');
const Bookmark = require('../module/bookmark');
const FollowTag = require('../module/follow_tag');
const FollowAccount = require('../module/follow_account');
const Vote = require('../module/vote');
const LockAccount = require('../module/lock_account');
const Notification = require('../module/notification');

var Auth = require('../../../auth');

/**
 * Đăng nhập
 * @body   account_name, password
 */
router.post('/login', async(req, res, next)=>{
    try{
        let username = req.body.account_name;
        let password = req.body.password;

        if(!(username && password)){
            return res.status(404).json({
                message: 'Thiếu thông tin đăng nhập',
                use: username,
                pass: password
            })
        }

        let exist = await Account.hasByUsername(username);

        if(exist){
            let acc = await Account.selectByUsername(username);
            let match = await bcrypt.compare(password, acc.password);

            if(match){
                var data = {
                    "id_account": acc.id_account,
                    "id_role": acc.id_role,
                    "account_name": acc.account_name,
                    "status": acc.status,
                }
                        
                const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3600s'});

                return res.status(200).json({
                    message: 'đăng nhập thành công',
                    accessToken
                });
            }else{
                return res.status(400).json({
                    message: 'Mật khẩu hoặc tài khoản không đúng'
                });
            }
        }else{
            return res.status(400).json({
                message: 'Mật khẩu hoặc tài khoản không đúng',
            });
        }
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
})


/**
 * Lấy danh sách tất cả tài khoản
 * 
 * @permission Chỉ Moder trở lên mới được thực thi
 */
router.get('/all', Auth.authenGTModer, async (req, res, next) => {
    let acc = await Account.selectId(Auth.tokenData(req).id_account);
    if(acc.status!=0){
        return res.status(400).json({
            message: 'Tài khoản đang bị khóa'
        })
    }else{
        var list = await Account.selectAll();

        return res.status(200).json({
            message: 'Account ok',
            data: list
        });
    }
    
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
 * Thêm 1 tài khoản thường
 * 
 * @permisson   Ai cũng có thể thực thi
 * @return      201: Tạo thành công, trả về id vừa được thêm
 *              400: Thiếu thông tin đăng ký
 */
router.post('/', async (req, res, next) => {
    try {
        var { account_name, real_name, email, password } = req.body;

        if (account_name && real_name && email && password) {
            let id_role = 3;
            bcrypt.hash(password, saltRounds, async(err, hash) => {
                password = hash;
                if(err){
                    console.log(err);
                    return res.sendStatus(500);
                }
                let acc = { account_name, real_name, email, password, id_role };
                let insertId = await Account.add(acc);

                res.status(201).json({
                    message: 'Tạo mới tài khoản thành công',
                    data: {
                        id: insertId
                    }
                })
            });
            
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

router.patch('/:id/change_password', Auth.authenGTUser, async(req, res, next)=>{
    try{

        let new_password = req.body.new_passwod;
        let id_account = Auth.tokenData(req).id_account;
        if(new_password){
            bcrypt.hash(new_password, saltRounds, async(err, hash) => {
                new_password = hash;
                if(err){
                    console.log(err);
                    return res.sendStatus(500);
                }
                let changePassword = await Account.updatePassword(id_account, new_password);

                res.status(201).json({
                    message: 'Thay đổi mật khẩu thành công',
                })
            });
        }else{
            return res.status(400).json({
                message: 'Thiếu thông tin'
            });
        }

    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
});

router.post('/create/moderator', Auth.authenAdmin, async (req, res, next) => {
    try {
        var { account_name, real_name, email, password } = req.body;

        if (account_name && real_name && email && password) {
            let id_role = 2;
            bcrypt.hash(password, saltRounds, async(err, hash) => {
                password = hash;
                if(err){
                    console.log(err);
                    return res.sendStatus(500);
                }
                let acc = { account_name, real_name, email, password, id_role };
                let insertId = await Account.add(acc);

                res.status(201).json({
                    message: 'Tạo mới tài khoản thành công',
                    data: {
                        id: insertId
                    }
                })
            });
            
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

router.post('/create/admin', Auth.authenAdmin, async (req, res, next) => {
    try {
        var { account_name, real_name, email, password } = req.body;

        if (account_name && real_name && email && password) {
            let id_role = 1;
            bcrypt.hash(password, saltRounds, async(err, hash) => {
                password = hash;
                if(err){
                    console.log(err);
                    return res.sendStatus(500);
                }
                let acc = { account_name, real_name, email, password, id_role };
                let insertId = await Account.add(acc);

                res.status(201).json({
                    message: 'Tạo mới tài khoản thành công',
                    data: {
                        id: insertId
                    }
                })
            });
            
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

router.post('/create/admin_account/init', async (req, res, next) => {
    try {
        var { account_name, real_name, email, password } = req.body;
        let amount_admin = await Account.countAdmin();
        if(amount_admin >1 ){
            res.status(405).json({
                message: 'Không thể thực hiện thao tác này'
            });
        }

        if (account_name && real_name && email && password) {
            let id_role = 1;
            bcrypt.hash(password, saltRounds, async(err, hash) => {
                password = hash;
                if(err){
                    console.log(err);
                    return res.sendStatus(500);
                }
                let acc = { account_name, real_name, email, password, id_role };
                let insertId = await Account.add(acc);

                res.status(201).json({
                    message: 'Tạo mới tài khoản thành công',
                    data: {
                        id: insertId
                    }
                })
            });
            
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

router.post('/:id/ban', Auth.authenGTModer, async (req, res, next)=>{
    try{
        let id_account_lock = req.params.id;
        let id_account_boss = Auth.tokenData(req).id_account;
        let reason = req.body.reason;
        let hours_lock = req.body.hours_lock;
        let exist = await Account.has(id_account_lock);
        if(!exist){
            return res.status(404).json({
                message: 'Không tìm thấy tài khoản bị khóa',
            });
        }

        let acc_boss = await Account.selectId(id_account_boss);
        let acc_lock = await Account.selectId(id_account_lock);

        if(acc_boss.status!=0 || acc_boss.id_role >= acc_lock.id_role){
        // if(acc_boss.status!=0 || 1 == 1){
            return res.status(403).json({
                message: 'Tài khoản không có quyền thực hiện',
            });
        }

        if(Number(hours_lock)<1 || Number(hours_lock)>576){
            return res.status(401).json({
                message: 'Thời gian khóa chỉ được nhỏ hơn 576 giờ'
            });
        }

        if(acc_lock.status!=0){
            return res.status(202).json({
                message: 'Tài khoản này đã bị khóa'
            })
        }

        if(reason && hours_lock && isNumber(hours_lock)){
            let ban = LockAccount.add(id_account_lock, id_account_boss, reason, hours_lock);
            let notify = Notification.addNotification(id_account_lock, `Tài khoản của bạn đã bị khóa ${hours_lock} giờ`, `/account/${id_account_lock}`)
            // setTimeout(unLockAccount(id_account_lock), Number(hours_lock)*3600000);
            let lock = Account.updateStatus(id_account_lock, 1);
            setTimeUnlock(id_account_lock, Number(hours_lock)*3600000);
            res.status(200).json({
                message: 'Chặn tài khoản thành công'
            });

        }else{
            return res.status(400).json({
                message: 'Thiếu dữ liệu hoặc định dạng không đúng'
            });
        }

    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
});

router.patch('/:id/unlock', Auth.authenGTModer, async(req, res, next)=>{
    let id_account_lock = req.params.id;
    let id_account_boss = Auth.tokenData(req).id_account;
    let exist = Account.has(id_account_lock);

    if(!exist){
        return res.status(404).json({
            message: 'Không tìm thấy tài khoản cần mở khóa'
        });
    }

    let acc_boss = Account.selectId(id_account_boss);
    let acc_lock = Account.selectId(id_account_lock);

    if(acc_boss.status!=0 || acc_boss.id_role >= acc_lock.id_role || acc_lock.status == 2){
        return res.status(403).json({
            message: 'Tài khoản không có quyền thực hiện'
        });
    }else{
        let unlock = Account.updateStatus(id_account_lock, 0);
        let notify = Notification.addNotification(id_account_lock, 'Tài khoản của bạn đã được mở khóa', `/account/${id_account_lock}`);
        return res.status(200).json({
            message: 'Mở khóa tài khoản thành công'
        });
    }
});

router.post('/:id/die', Auth.authenAdmin, async (req, res, next)=>{
    try{
        let id_account_lock = req.params.id;
        let reason = req.body.reason;
        let exist = Account.has(id_account_lock);
        if(!exist){
            return res.status(404).json({
                message: 'Không tìm thấy tài khoản bị khóa'
            });
        }
        let acc_lock = Account.selectId(id_account_lock);

        if(reason){
            let ban = LockAccount.add(id_account_lock, Auth.tokenData(req).id_account, reason, 0);
            let notify = Notification.addNotification(id_account_lock, `Tài khoản của bạn đã bị khóa vô thời hạn`);
            res.status(200).json({
                message: 'Khóa vĩnh viễn tài khoản thành công'
            });
        }else{
            return res.status(400).json({
                message: 'Thiếu dữ liệu hoặc định dạng không đúng'
            });
        }

    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
});

router.patch('/:id/revive', Auth.authenAdmin, async(req, res, next)=>{
    let id_account_lock = req.params.id;
    let exist = Account.has(id_account_lock);

    if(!exist){
        return res.status(404).json({
            message: 'Không tìm thấy tài khoản cần mở khóa'
        });
    }

    let acc_lock = Account.selectId(id_account_lock);
    let unlock = Account.updateStatus(id_account_lock, 0);
    let notify = Notification.addNotification(id_account_lock, 'Tài khoản của bạn đã được mở khóa', `/account/${id_account_lock}`);
    return res.status(200).json({
        message: 'Mở khóa tài khoản thành công'
    });
});

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

function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); } 

async function unLockAccount(id_account){
    let acc = await Account.selectId(id_account);
    if(acc.status==1){
        let update = Account.updateStatus(id_account, 0);
        let notify = Notification.addNotification(id_account, 'Tài khoản của bạn đã được mở khóa', `/account/${id_account}`);
    }
    
}

function setTimeUnlock(id_account_lock, time){
    setTimeout(unLockAccount, 20000, id_account_lock);
}
module.exports = router;