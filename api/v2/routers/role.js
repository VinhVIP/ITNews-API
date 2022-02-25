const express = require('express');
const router = express.Router();
var Auth = require('../../../auth');
const Role = require('../module/role');

/**
 * Danh sách chức vụ
 * @params      i
 * 
 * @body        
 * 
 * @permisson   Moder trở lên
 * 
 * @return      200: thao tác thành công
 */
router.get('/', Auth.authenGTModer, async (req, res, next) => {
    try {
        let result = await Role.selectAll();
        res.status(200).json({
            message: 'Lấy danh sách chức vụ thành công',
            data: result
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: 'Something wrong!'
        })
    }
})

/**
 * Tìm chức vụ
 * @params      
 * 
 * @body        
 * 
 * @permisson   Chỉ moder trở lên
 * 
 * @return      200: Thao tác thành công
 */
router.get('/:id', Auth.authenGTModer, async (req, res, next) => {
    try {
        let id = req.params.id;

        let exists = await Role.has(id);

        if (exists) {
            let result = await Role.selectId(req.params.id);
            res.status(200).json({
                message: 'Tìm thấy chức vụ',
                data: result
            })
        } else {
            res.status(404).json({
                message: 'Không tìm thấy chức vụ này'
            })
        }

    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: 'Something wrong!'
        })
    }
})

module.exports = router;