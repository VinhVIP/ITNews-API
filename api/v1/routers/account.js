const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const mailer = require('../../../mail');

const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const Account = require('../module/account');
const Role = require('../module/role');
const Post = require('../module/post');
const Bookmark = require('../module/bookmark');
const FollowTag = require('../module/follow_tag');
const FollowAccount = require('../module/follow_account');
const Vote = require('../module/vote');
const LockAccount = require('../module/lock_account');
const Notification = require('../module/notification');
const Verification = require('../module/verification');
const Mailer = require('../../../mail');
const Information = require('../module/information');

var Auth = require('../../../auth');
const e = require('express');
const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

var upload = multer({
    storage: storage,
});

/**
 * Đăng nhập
 * @body   account_name, password
 */
router.post('/login', async (req, res, next) => {
    try {
        let username = req.body.account_name;
        let password = req.body.password;

        if (!(username && password)) {
            return res.status(404).json({
                message: 'Thiếu thông tin đăng nhập',
                use: username,
                pass: password
            })
        }

        let exist = await Account.hasByUsername(username);

        if (exist) {
            let acc = await Account.selectByUsername(username);
            let match = await bcrypt.compare(password, acc.password);

            if (acc.account_status == 1) {
                let valid = await LockAccount.check(acc.id_account);
                if (valid) {
                    Account.updateStatus(acc.id_account, 0);
                }
            }

            if (match) {
                var data = {
                    "id_account": acc.id_account,
                    "id_role": acc.id_role,
                    "account_name": acc.account_name,
                    "account_status": acc.account_status,
                }
                let days_token = await Information.selectToken();
                const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `${days_token}d` });

                return res.status(200).json({
                    message: 'đăng nhập thành công',
                    accessToken: accessToken,
                    data: data
                });
            } else {
                return res.status(400).json({
                    message: 'Mật khẩu hoặc tài khoản không đúng'
                });
            }
        } else {
            return res.status(400).json({
                message: 'Mật khẩu hoặc tài khoản không đúng',
            });
        }
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Tạo tài khoản moderator
 * @params      
 * 
 * @body        account_name, real_name, email, password 
 * 
 * @permisson   Chỉ có admin (id_role == 1)
 * 
 * @return      201: Tạo thành công
 *              400: Thiếu dữ liệu body
 */
router.post('/create/moderator', Auth.authenAdmin, async (req, res, next) => {
    try {
        var { account_name, real_name, email, password } = req.body;

        if (account_name && real_name && email && password) {
            let id_role = 2;
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                password = hash;
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                let avatar = await Information.selectAvatar();
                let acc = { account_name, real_name, email, password, id_role, avatar };
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
 * Thêm tài khoản admin
 * @params      
 * 
 * @body        account_name, real_name, email, password
 * 
 * @permisson   Chỉ có admin (id_rold == 1)
 * 
 * @return      201: Tạo thành công
 *              400: Thiếu body
 */
router.post('/create/admin', Auth.authenAdmin, async (req, res, next) => {
    try {
        var { account_name, real_name, email, password } = req.body;

        if (account_name && real_name && email && password) {
            let id_role = 1;
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                password = hash;
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                let avatar = await Information.selectAvatar();
                let acc = { account_name, real_name, email, password, id_role, avatar };
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
 * Tạo tài khoản admin khởi đầu (lúc mới tạo web) (chỉ tạo được khi chưa có tài khoản admin nào)
 * @params      
 * 
 * @body        account_name, real_name, email, password
 * 
 * @permisson   Ai cũng có thể thực thi
 * 
 * @return      201: tạo thành công
 *              400: Thiếu body
 */
router.post('/create/admin_account/init', async (req, res, next) => {
    try {
        var { account_name, real_name, email, password } = req.body;
        let amount_admin = await Account.countAdmin();
        if (amount_admin > 1) {
            res.status(405).json({
                message: 'Không thể thực hiện thao tác này'
            });
        }

        if (account_name && real_name && email && password) {
            let id_role = 1;
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                password = hash;
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                let avatar = await Information.selectAvatar();
                let acc = { account_name, real_name, email, password, id_role, avatar };
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
 * Khóa tài khoản tạm thời
 * @params      id: id người bị khóa 
 * 
 * @body        reasom, hours_lock
 * 
 * @permisson   từ moder trở lên
 * 
 * @return      200: Thao tác thực hiện
 *              202: tài khoản cần kháo đang bị khóa
 *              400: Mật khẩu mới chưa được nhập
 *              401: thời gian tối đa là 576, tối thiểu là 1
 *              403: Tài khoản không có quyền
 *              404: Không thấy tài khoản cần khóa
 */
router.post('/:id/ban', Auth.authenGTModer, async (req, res, next) => {
    try {
        let id_account_lock = req.params.id;
        let id_account_boss = Auth.tokenData(req).id_account;
        let reason = req.body.reason;
        let hours_lock = req.body.hours_lock;
        let exist = await Account.has(id_account_lock);
        if (!exist) {
            return res.status(404).json({
                message: 'Không tìm thấy tài khoản bị khóa',
            });
        }

        let acc_boss = await Account.selectId(id_account_boss);
        let acc_lock = await Account.selectId(id_account_lock);

        if (acc_boss.account_status != 0 || acc_boss.id_role >= acc_lock.id_role) {
            return res.status(403).json({
                message: 'Tài khoản không có quyền thực hiện',
            });
        }

        if (Number(hours_lock) < 1 || Number(hours_lock) > 576) {
            return res.status(401).json({
                message: 'Thời gian khóa chỉ được nhỏ hơn 576 giờ'
            });
        }

        if (acc_lock.account_status != 0) {
            return res.status(202).json({
                message: 'Tài khoản này đã bị khóa'
            })
        }

        if (reason && hours_lock && isNumber(hours_lock)) {
            let ban = LockAccount.add(id_account_lock, id_account_boss, reason, hours_lock);
            let notify = Notification.addNotification(id_account_lock, `Tài khoản của bạn đã bị khóa ${hours_lock} giờ`, `/account/${id_account_lock}`)
            let lock = Account.updateStatus(id_account_lock, 1);
            setTimeUnlock(id_account_lock, Number(hours_lock) * 3600000);
            res.status(200).json({
                message: 'Chặn tài khoản thành công'
            });

        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu hoặc định dạng không đúng'
            });
        }

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
});

/**
 * Quên mật khẩu
 * @params      
 * 
 * @body        account_name
 * 
 * @permisson   Ai cũng có thể thực thi
 * 
 * @return      200: Gửi mail thành công, trả về dữ liệu của tài khoản (để qua /:id/confirm)
 *              400: Thiếu body
 *              404: Không tìm thấy username
 */
router.post('/forgot/password', async (req, res, next) => {
    try {
        let username = req.body.account_name;
        if (!username) {
            return res.status(400).json({
                message: 'Thiếu dữ liệu gửi về'
            });
        }

        let exist = await Account.hasByUsername(username);

        if (!exist) {
            return res.status(404).json({
                message: 'Không tồn tại tài khoản này'
            });
        } else {
            let acc = await Account.selectByUsername(username);
            let code = await createCode();

            bcrypt.hash(code, saltRounds, async (err, hash) => {
                let send = Mailer.sendVerification(acc.email, code);
                code = hash;
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                let minutes = await Information.selectCode();
                let id_verify = await Verification.add(acc.id_account, code, minutes);
                let del = autoDeleteCode(id_verify);
            });

            res.status(200).json({
                message: 'Đã gửi mã xác nhận',
                id_account: acc.id_account
            });
        }
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
});

/**
 * WARNING
 * Xác nhận mã (mã có hiệu lực trong 60s)
 * @params      id tài khoản cần lấy lại
 * 
 * @body        code
 * 
 * @permisson   Ai cũng có thể thực thi
 * 
 * @return      200: Đổi thành công, trả về jwt để thêm vào header (xog thì chuyển qua đổi mật khẩu)
 *              400: Mã không đúng
 *              404: Mã hết hạn
 */
router.post('/:id/confirm', async (req, res, next) => {
    try {
        let code = req.body.code;
        let id_account = req.params.id;

        let exist = await Verification.has(id_account);
        if (!exist) {
            return res.status(404).json({
                message: 'Mã đã hết hạn'
            })
        }

        let valid = await Verification.check(id_account);
        if (!valid) {
            let deleteCode = await Verification.deleteByAccount(id_account);
            return res.status(404).json({
                message: 'Mã đã hết hạn'
            })
        }

        let verify = await Verification.selectCode(id_account);
        let match = await bcrypt.compare(code, verify);
        if (match) {
            let acc = await Account.selectId(id_account);
            var data = {
                "id_account": acc.id_account,
                "id_role": acc.id_role,
                "account_name": acc.account_name,
                "account_status": acc.account_status,
            }
            let days_token = await Information.selectToken();
            const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `${days_token}d` });

            return res.status(200).json({
                message: 'đăng nhập thành công',
                accessToken: accessToken,
                data: data
            });
        } else {
            return res.status(400).json({
                message: 'Mật mã không đúng'
            });
        }
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Đổi password của cá nhân
 * @params      id: để chơi, không dùng đến (để 1 số bất kỳ thì nó cũng hoạt động dc)
 * 
 * @body        
 * 
 * @permisson   Ai cũng có thể thực thi
 * 
 * @return      201: Đổi thành công
 *              400: Mật khẩu mới chưa được nhập
 */
router.put('/:id/change_password', Auth.authenGTUser, async (req, res, next) => {
    try {
        let new_password = req.body.new_password;
        let id_account = Auth.tokenData(req).id_account;

        if (new_password.trim() != "") {
            bcrypt.hash(new_password, saltRounds, async (err, hash) => {
                new_password = hash;
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                let changePassword = await Account.updatePassword(id_account, new_password);

                res.status(201).json({
                    message: 'Thay đổi mật khẩu thành công',
                })
            });
        } else {
            return res.status(400).json({
                message: 'Thiếu thông tin'
            });
        }

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
});

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
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                password = hash;
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                let avatar = await Information.selectAvatar();
                let acc = { account_name, real_name, email, password, id_role, avatar };
                let insertId = await Account.add(acc);

                res.status(201).json({
                    message: 'Tạo mới tài khoản thành công',
                    data: insertId
                });
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

        let date = checkDate(req.body.birth)
        if (date === false) {
            return res.status(400).json({
                message: 'Ngày sinh không hợp lệ'
            })
        } else {
            req.body.birth = date;
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

function checkDate(date) {
    let arr = date.split('/');

    let day = parseInt(arr[0]);
    let month = parseInt(arr[1]);
    let year = parseInt(arr[2]);

    if (checkMonth(month) && day > 0 && day <= lastDayOfMonth(day, month, year)) {
        return month + '/' + day + '/' + year;
    }
    return false;
}

function lastDayOfMonth(day, month, year) {
    if (month == 2) {
        if (isLeapYear(year)) return 29;
        return 28;
    } else if (month == 4 || month == 6 || month == 9 || month == 11) {
        return 30;
    }
    return 31;
}

function checkMonth(month) {
    return month > 0 && month <= 12;
}

function isLeapYear(year) {
    if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)) return true;
    return false;
}

/**
 * Lấy thông tin của tài khoản
 * @permission  người đã đăng nhập
 * @returns     200: lấy dữ liệu thành công
 */
router.get('/information', Auth.authenGTUser, async (req, res, next) => {
    try {
        let acc = await Account.selectId(Auth.tokenData(req).id_account);
        return res.status(200).json({
            message: "Lấy thông tin thành công",
            data: acc
        })
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Lấy avatar của mình
 */
router.get('/avatar', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let path = await Account.selectAvatar(id_account);
        let image = fs.readFile(path, (err, data) => {
            if (err) {
                return res.sendStatus(500);
            } else {
                return res.end(data);
            }
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Lấy avatar của người khác 
 */
router.get('/:id_account/avatar', async (req, res, next) => {
    try {
        let id_account = req.params.id_account;
        let exist = await Account.has(id_account);
        if (exist) {
            let path = await Account.selectAvatar(id_account);
            let image = fs.readFile(path, (err, data) => {
                console.log(path);
                if (err) {
                    return res.sendStatus(500);
                } else {
                    return res.end(data);
                }
            });
        } else {
            return res.status(404).json({
                message: "id tài khoản không tồn tại"
            })
        }

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Lấy danh sách tất cả tài khoản
 * 
 * @permission Chỉ Moder trở lên mới được thực thi
 */
router.get('/all', async (req, res, next) => {
    try {
        const authorizationHeader = req.headers['authorization'];

        let list;

        if (authorizationHeader) {
            const token = authorizationHeader.split(' ')[1];
            if (!token) return res.sendStatus(401);

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(403);
                }
            })

            let acc = await Account.selectId(Auth.tokenData(req).id_account);
            list = await Account.selectAllByAccount(acc.id_account);
        } else {
            list = await Account.selectAll();
        }
        return res.status(200).json({
            message: 'Lấy danh sách tài khoản thành công',
            data: list
        });
        // }
    } catch (err) {
        console.log(err);
        return res.sendStatus(500)
    }
});

/**
 * Lấy danh sách tất cả tài khoản, kiểm tra xem ng dùng hiện tại có đang follow tài khoản hay không
 * 
 * @permission Chỉ Moder trở lên mới được thực thi
 */
router.get('/all_loggedin', Auth.authenGTUser, async (req, res, next) => {
    try {
        let acc = await Account.selectId(Auth.tokenData(req).id_account);

        var list = await Account.selectAllByAccount(acc.id_account);

        return res.status(200).json({
            message: 'Lấy danh sách tài khoản thành công',
            data: list
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500)
    }
});

/**
 * Lấy danh sách tất cả thông đã bị khóa
 * 
 * @permission  Chỉ Admin
 * @return      200: Trả về danh sách
 *              403: Tài khoản không có quyền
 */
router.get('/account_locked/all', Auth.authenAdmin, async (req, res, next) => {
    try {
        let acc = await Account.selectId(Auth.tokenData(req).id_account);
        if (acc.status != 0) {
            return res.status(403).json({
                message: 'Tài khoản đang bị khóa'
            })
        } else {
            var list = await LockAccount.selectAll();

            return res.status(200).json({
                message: 'Thao tác thực hiện',
                data: list
            });
        }
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
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
 * Lấy thông tin 1 tài khoản theo id, có status
 * 
 * @permission  không cần
 * 
 * @return      200: trả về tài khoản tìm thấy
 *              404: Không tìm thấy
 */
router.get('/:id/status/:id_user', async (req, res, next) => {
    try {
        let idUser = req.params.id_user;
        let id = req.params.id;
        let accountExists = await Account.has(id);

        if (accountExists) {
            let result = await Account.selectIdStatus(id, idUser);

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
 * @permission  Ai cũng có thể thực thi
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
            let post = await Post.selectId(postsId[i].id_post);
            let tags = await Post.selectTagsOfPost(postsId[i].id_post);
            data.push({
                post: post,
                tags: tags
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
router.get('/:id/bookmarks', async (req, res, next) => {
    try {
        let id = req.params.id;

        let accExists = await Account.has(id);
        if (accExists) {
            let postsId = await Bookmark.list(id);
            let data = [];
            for (let i = 0; i < postsId.length; i++) {
                let post = await Post.selectId(postsId[i].id_post);
                let acc = await Account.selectId(post.id_account);
                let tags = await Post.selectTagsOfPost(postsId[i].id_post);
                data.push({
                    post: post,
                    author: acc,
                    tags: tags
                });
            }

            res.status(200).json({
                message: 'Lấy danh sách bài viết nháp thành công',
                data: data
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

        const authorizationHeader = req.headers['authorization'];

        let idUser = false;

        if (authorizationHeader) {
            const token = authorizationHeader.split(' ')[1];
            if (!token) return res.sendStatus(401);

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(401);
                }
            })

            idUser = Auth.tokenData(req).id_account;
        }

        let accExists = await Account.has(id);
        if (accExists) {
            let result = await FollowAccount.listFollowingOf(id);
            let data = [];
            for (let accFollowing of result) {
                let acc;
                if (idUser === false) acc = await Account.selectId(accFollowing.id_following);
                else acc = await Account.selectIdStatus(accFollowing.id_following, idUser);
                data.push(acc)
            }

            res.status(200).json({
                message: 'Lấy danh sách các tài khoản theo dõi người này thành công',
                data: data
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

        const authorizationHeader = req.headers['authorization'];

        let idUser = false;

        if (authorizationHeader) {
            const token = authorizationHeader.split(' ')[1];
            if (!token) return res.sendStatus(401);

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(401);
                }
            })

            idUser = Auth.tokenData(req).id_account;
        }

        let accExists = await Account.has(id);
        if (accExists) {
            let result = await FollowAccount.listFollowerOf(id);
            let data = [];
            for (let accFollowing of result) {
                let acc;
                if (idUser === false) acc = await Account.selectId(accFollowing.id_follower);
                else acc = await Account.selectIdStatus(accFollowing.id_follower, idUser);
                data.push(acc)
            }

            res.status(200).json({
                message: 'Lấy danh sách các tài khoản theo dõi người này thành công',
                data: data
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
});

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

/**
 * Thay đổi thông tin tài khoản, chỉ có thể đổi của chính bản thân
 * 
 * @permission  phải đăng nhập thì mới được thực thi (user trở lên)
 * @return      401: Không được sửa thông tin của người khác
 *              400: Thiếu thông tin bắt buộc
 *              200: Cập nhật thành công, trả về tài khoản vừa cập nhật
 */
router.put('/change/information', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;

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

        let result = await Account.update(id_account, account);

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
 * Mở khóa tài khoản
 * @params      id (id_locker)
 * 
 * @permisson   Moder trở lên
 * 
 * @return      200: Mở thành công
 *              403: Tài khoản không có quyền
 *              404: Không thấy tài khoản cần mở
 */
router.patch('/:id/unlock', Auth.authenGTModer, async (req, res, next) => {
    let id_account_lock = req.params.id;
    let id_account_boss = Auth.tokenData(req).id_account;
    let exist = await Account.has(id_account_lock);

    if (!exist) {
        return res.status(404).json({
            message: 'Không tìm thấy tài khoản cần mở khóa'
        });
    }

    let acc_boss = await Account.selectId(id_account_boss);
    let acc_lock = await Account.selectId(id_account_lock);

    if (acc_boss.account_status != 0 || acc_boss.id_role >= acc_lock.id_role || acc_lock.account_status == 2) {
        return res.status(403).json({
            message: 'Tài khoản không có quyền thực hiện'
        });
    } else {
        let unlock = Account.updateStatus(id_account_lock, 0);
        let notify = Notification.addNotification(id_account_lock, 'Tài khoản của bạn đã được mở khóa', `/account/${id_account_lock}`);
        return res.status(200).json({
            message: 'Mở khóa tài khoản thành công'
        });
    }
});

/**
 * Khóa vĩnh viễn
 * @params      id: id người bị khóa
 * 
 * @body        reason
 * 
 * @permisson   Chỉ có admin
 * 
 * @return      200: Thao tác thành công
 *              400: Thiếu body
 *              404: không thấy người cần khóa
 */
router.patch('/:id/die', Auth.authenAdmin, async (req, res, next) => {
    try {
        let id_account_lock = req.params.id;
        let reason = req.body.reason;
        let exist = Account.has(id_account_lock);
        if (!exist) {
            return res.status(404).json({
                message: 'Không tìm thấy tài khoản bị khóa'
            });
        }
        let acc_lock = Account.selectId(id_account_lock);

        if (reason) {
            let save = LockAccount.add(id_account_lock, Auth.tokenData(req).id_account, reason, 0);
            let notify = Notification.addNotification(id_account_lock, `Tài khoản của bạn đã bị khóa vô thời hạn`, `/account/${id_account_lock}`);
            let kill = Account.updateStatus(id_account_lock, 2);
            res.status(200).json({
                message: 'Khóa vĩnh viễn tài khoản thành công'
            });
        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu hoặc định dạng không đúng'
            });
        }

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
});

/**
 * Mở khóa
 * @params      id: id người cần mở khóa
 * 
 * @body        
 * 
 * @permisson   Chỉ có admin
 * 
 * @return      201: Đổi thành công
 *              404: Không tìm thấy tài khoản cần mở khóa
 */
router.patch('/:id/revive', Auth.authenAdmin, async (req, res, next) => {
    let id_account_lock = req.params.id;
    let exist = Account.has(id_account_lock);

    if (!exist) {
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
 * Cập nhật logo
 * @body   image
 */
router.put('/update/avatar', Auth.authenGTUser, upload.single('image'), async (req, res, next) => {
    try {
        let file = req.file;
        let id_account = Auth.tokenData(req).id_account;

        if (!file) {
            return res.status(400).json({
                message: 'Tải file không thành công'
            });
        } else {
            let old_image = await Account.selectAvatar(id_account);
            let default_avatar = await Information.selectAvatar();
            if (default_avatar != old_image) {
                fs.unlinkSync(old_image);
            }
            let update = await Account.updateAvatar(id_account, file.path);
            return res.status(200).json({
                message: "cập nhật avatar thành công"
            })
        }
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

// router.('', async(req, res, next)=>{
//     try{

//     }catch(err){
//         console.log(err);
//         return res.sendStatus(500);
//     }
// })

function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

async function unLockAccount(id_account) {
    let acc = await Account.selectId(id_account);
    if (acc.status == 1) {
        let update = Account.updateStatus(id_account, 0);
        let notify = Notification.addNotification(id_account, 'Tài khoản của bạn đã được mở khóa', `/account/${id_account}`);
    }
}

function setTimeUnlock(id_account_lock, time) {
    setTimeout(unLockAccount, time, id_account_lock);
}

function deleteCode(id_verification) {
    let del = Verification.delete(id_verification);
}

async function autoDeleteCode(id_verification) {
    let minute = await Information.selectCode();

    setTimeout(deleteCode, minute * 1000 * 60, id_verification);
}

async function createCode() {
    var result = '';
    for (var i = 0; i < 6; i++) {
        result += String(Math.floor(Math.random() * 10));
    }
    return result;
}

module.exports = router;