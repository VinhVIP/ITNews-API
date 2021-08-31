const express = require('express');
const router = express.Router();

const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });

const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

var upload = multer({
    storage: storage,

    // limits: {
    //     fileSize: 1024 * 1024 * 5
    // },
    // fileFilter: fileFilter
});


router.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

router.post('/', upload.single('avatar'), (req, res, next) => {
    console.log('up file ok');

    res.status(200).json({
        message: 'Upload file OK',
        name: req.body.name
    });
});

module.exports = router;