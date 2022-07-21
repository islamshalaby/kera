var Classes = require("../../Models/class")

// get classes
exports.getClasses = (req, res) => {
    Classes.find({associationId : req.user._id}, (err, data) => {
        if (err) throw err

        res.render("association/classes", {
            data,
            profile : req.profile
        })
    })
}

// post add new class
exports.postAddNewClass = (req, res) => {
    var post = req.body

    post.associationId = req.user._id

    Classes.addNewClass(post, (err) => {
        if (err) throw err

        res.redirect("back")
    })
}

// get delete class
exports.getDeleteClass = async (req, res) => {
    var classId = req.params.classId,
        data = await Classes.findByIdAndRemove(classId)

    res.redirect('back')
}

// update class
exports.updateClass = async (req, res) => {
    var id = req.params.id,
        post = req.body,
        clss = await Classes.findByIdAndUpdate(id, {$set : post})

    res.redirect('back')
}