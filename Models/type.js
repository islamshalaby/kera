const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var typeSchema = mongoose.Schema({
    title : String,
    deleted : {
        type : Boolean,
        default : false
    }
})

var Types = module.exports = mongoose.model('types', typeSchema)