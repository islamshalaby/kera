var Buses = require('../../Models/bus')

// get buses
exports.getBuses = (req, res) => {
    Buses.find({associationId : req.user._id ,deleted : false}, (err, data) => {
        if (err) throw err

        res.render('association/buses', {
            data,
            profile : req.profile
        })
    })
}

// post add new bus
exports.postAddNewBus = (req, res) => {
    var post = req.body

    post.associationId = req.user
    Buses(post).save((err) => {
        if (err) throw err

        res.redirect("back")
    })
}

// delete bus
exports.deleteBus = (req, res) => {
    var id = req.params.id
    Buses.findByIdAndUpdate(id, {$set : {deleted : true}}, (err) => {
        if (err) throw err

        res.redirect("back")
    })
}