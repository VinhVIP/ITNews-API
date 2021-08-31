const e = require('express');
const express = require('express');
const router = express.Router();
var Auth = require('../../../auth');

var Tag = require('../module/tag');

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