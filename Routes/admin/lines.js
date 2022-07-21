var express = require('express'),
    router = express.Router(),
    associationAuth = require('../../middleware/associationAuth'),
    linesController = require('../../Controller/admin/lines')

router.all('/*', associationAuth, (req, res, next) => {
    next()
})

// get add new line
router.get('/new', linesController.getAddNewLine)

// post add new line
router.post('/new', linesController.postAddNewLine)

// get edit line
router.get('/edit/:id', linesController.getEditLine)

// post edit line
router.post('/edit/:id', linesController.postEditLine)

// get lines
router.get('/:page', linesController.getlines)




module.exports = router