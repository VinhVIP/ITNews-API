const express = require('express');
const router = express.Router();

const Book = require('../module/book');

router.get('/', async (req, res, next) => {
    if (Object.keys(req.query).length === 0) {
        // GET tất cả sách
        const allBooks = await Book.selectAll();

        return res.status(200).json({
            message: 'Get all books successfully',
            data: allBooks
        })
    } else {
        // Có tham số truyền vào
        if (req.query.q) {
            const books = await Book.find(req.query.q);

            return res.status(200).json({
                message: 'Found books by keyword',
                data: books
            });
        } else {
            return res.status(400).json({
                message: 'Bad Request'
            });
        }
    }
})

router.get('/:id', async (req, res, next) => {
    const id = req.params.id;

    const book = await Book.selectID(id);

    if (book) {
        res.status(200).json({
            message: 'Found book',
            data: book
        })
    } else {
        return res.status(404).json({
            message: 'Book Not Found'
        })
    }

})

router.post('/', async (req, res, next) => {
    if (!req.body.id || !req.body.name || !req.body.author || !req.body.type) {
        return res.status(400).json({
            message: 'Missing value'
        });
    }

    await Book.add(req.body);

    return res.status(201).json({
        message: 'Add Book succesfully',
    });


});

router.delete('/:id', async (req, res, next) => {
    const id = req.params.id;

    let book = await Book.selectID(id);

    if (book) {
        let result = await Book.remove(id);

        if (result) {
            return res.status(200).json({
                message: 'Book Deleted',
            })
        } else {
            return res.status(500).json({
                message: 'Something went wrong',
            })
        }
    } else {
        return res.status(404).json({
            message: 'Book Not Found',
        })
    }

})

router.put('/:id', async (req, res, next) => {
    if (!req.body.name || !req.body.author || !req.body.type) {
        return res.status(400).json({
            message: 'Missing value'
        });
    }

    let book = await Book.selectID(req.params.id);

    if (book) {
        let result = await Book.update(req.params.id, req.body);
        console.log(result);

        if (result) {
            return res.status(200).json({
                message: 'Update success',

            })
        } else {
            return res.status(500).json({
                message: 'Something went wrong',
            })
        }
    } else {
        return res.status(404).json({
            message: 'Book Not Found',
        })
    }

});


module.exports = router;