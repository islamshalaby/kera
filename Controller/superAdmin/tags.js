var Tags = require('../../Models/tag')

// get tags
exports.getTags = (req, res) => {
    Tags.find({deleted : false}, (err, data) => {
        if (err) throw err

        res.render('tags', {
            data,
            profile : req.profile
        })
    })
}

// post add new tag
exports.postAddNewTag = (req, res) => {
    var post = req.body
    Tags(post).save(err => {
        if (err) throw err

        res.redirect('back')
    })
}