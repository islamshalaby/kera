const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var classSchema = mongoose.Schema({
    name : String,
    students : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "students"
    }],
    teachers : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "teachers"
    }],
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    }
})
classSchema.plugin(mongoosePaginate)
var Classes = module.exports = mongoose.model('classes', classSchema)

// add new class
module.exports.addNewClass = (post, callBack) => {
    Classes(post).save(callBack)
}