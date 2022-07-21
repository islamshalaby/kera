const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate'),
    now = new Date()

var attendSchema = mongoose.Schema({
    teacher : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "teachers"
    },
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    arrivalTime : String,
    departureTime : String,
    formattedDate : {
        type : Date,
        default : new Date(now.getFullYear(), now.getMonth(), now.getDate())
    },
    date : {
        type: String, default: Date.now()
    }
})
attendSchema.plugin(mongoosePaginate)
var Attends = module.exports = mongoose.model('attends', attendSchema)