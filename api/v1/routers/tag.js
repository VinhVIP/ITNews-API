const express = require('express');
const router = express.Router();
var Auth = require('../../../auth');

var Tag = require('../module/tag');

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

module.exports = router;