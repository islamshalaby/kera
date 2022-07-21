const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var lineSchema = mongoose.Schema({
    name : String,
    points : [],
    days : [],
    users : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "users"
    }],
    tripTime : String,
    driverId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "drivers"
    },
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    }
})

lineSchema.plugin(mongoosePaginate)
var Lines = module.exports = mongoose.model('lines', lineSchema)

// add new line
module.exports.addNewLine = (post, callBack) => {
    Lines(post).save(callBack)
}

// get drivers
module.exports.getLines = (query, page, callback) => {
    var options = {
        page:   page,
        populate : {path : 'driverId', select : 'username'}, 
        limit:    50,
        sort: {
            _id : -1
        }
    }
    Lines.paginate(query, options, callback)
}

// edit line
module.exports.editLine = (id, post, callBack) => {
    Lines.findByIdAndUpdate(id, post, callBack)
}