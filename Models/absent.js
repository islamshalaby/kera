const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var absentSchema = mongoose.Schema({
    students : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "students"
    }],
    teacher : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "teachers"
    },
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    date : {
        type: String, default: Date.now()
    }
})
absentSchema.plugin(mongoosePaginate)
var Absents = module.exports = mongoose.model('absents', absentSchema)