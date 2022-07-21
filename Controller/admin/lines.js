var Lines = require('../../Models/line')

// get lines
exports.getlines = (req, res) => {
    var page = req.params.page
    Lines.getLines({associationId : req.user._id}, page, (err, lines) => {
        if (err) throw err

        res.render('association/lines', {
            data : lines.docs,
            profile : req.profile
        })
    })
}

// get add new line
exports.getAddNewLine = (req, res) => {
    res.render('association/lines_form', {
        type : "new",
        profile : req.profile
    })
}

// post add new line
exports.postAddNewLine = async (req, res) => {
    var post = req.body
    if (!post.days) {
        post.days = req.user.days
    }
    post.associationId = req.user._id
    Lines.addNewLine(post, (err) => {
        if (err) throw err

        res.redirect('/association-panel/lines/1')
    })
}

// get edit line
exports.getEditLine = async (req, res) => {
    var id = req.params.id,
        data = await Lines.findById(id)

    res.render('association/lines_form', {
        type : "edit",
        profile : req.profile,
        data
    })
}

// post edit line
exports.postEditLine = (req, res) => {
    var id = req.params.id,
        post = req.body

    Lines.editLine(id, post, (err) => {
        if (err) throw err

        res.redirect('/association-panel/lines/1')
    })
}