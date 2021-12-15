const express = require('express');
const router = express.Router();
const Feedback = require('../module/feedback');
const Auth = require('../../../auth');

/**
 * Lấy 1 feedback
 * @permission      admin
 * @params        id_feedback
 * @returns     202, 412
 */
router.get('/information/:id_feedback', Auth.authenAdmin, async (req, res, next) => {
    try {
        let id_feedback = req.params.id_feedback;

        let exist = await Feedback.has(id_feedback);
        if (!exist) {
            return res.status(400).json({
                message: "không có phản hồi này"
            })
        }

        let read = await Feedback.updateRead(id_feedback);
        let data = await Feedback.selectID(id_feedback);

        return res.json({
            message: "thao tác thành công",
            data: data
        })

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Lấy tất cả feedback
 * @permission  admin
 * @query        is_unread, page, num_rows
 
 */
router.get('/unread', Auth.authenAdmin, async (req, res, next) => {
    try {
        let data = [];
        data = await Feedback.selectUnread();

        return res.json({
            message: "thao tác thành công",
            data: data
        })
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Lấy số lượng feedback
 * @permission  admin
 * @query       is_unread

 */
router.get('/all/amount', Auth.authenAdmin, async (req, res, next) => {
    try {
        let is_unread = req.query.is_unread;
        let amount;
        if (!is_unread) {
            is_unread = 0;
        }

        if (is_unread == 0) {
            amount = await Feedback.selectAmountAll();
        } else {
            amount = await Feedback.selectAmountUnread();
        }

        return res.json({
            message: "thao tác thành công, trả về số lượng",
            amount: amount
        })
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Xóa feedback 
 * @permission  admin
 * @params       id_feedback 

 */
router.delete('/:id_feedback', Auth.authenAdmin, async (req, res, next) => {
    try {
        let id_feedback = req.params.id_feedback;
        let exist = await Feedback.has(id_feedback);
        if (!exist) {
            return res.status(404).json({
                message: "không có phản hồi này"
            })
        } else {
            let deleted = await Feedback.delete(id_feedback);
            return res.json({
                message: "Thao tác thành công"
            })
        }
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * Thêm feedback 
 * @body       subject, content
 * @returns     200, 400
 */
router.post('/', Auth.authenGTUser, async (req, res, next) => {
    try {
        let id_account = Auth.tokenData(req).id_account;
        let subject = req.body.subject;
        let content = req.body.content;
        if (subject && content) {
            let add = await Feedback.add(id_account, subject, content);
            return res.status(201).json({
                message: "Thêm phản hồi thành công"
            })
        } else {
            return res.status(400).json({
                message: "Thiếu body"
            })
        }
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

// router.('/', async(req, res, next)=>{
//     try{

//     }catch(err){
//         console.log(err);
//         return res.sendStatus(500);
//     }
// })

module.exports = router;