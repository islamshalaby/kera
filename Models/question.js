const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    fieldsAliasPlugin = require('mongoose-aliasfield')
var questionSchema = mongoose.Schema({
    question : {
        type : String
    },
    options : [{
        option : String,
        icon : String
    }],
    questionType : {
        type : Number   // 1 => input
                        // 2 => select
    },
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    sort : Number,
    deleted : {
        type : Boolean,
        default : false
    }
})
questionSchema.plugin(fieldsAliasPlugin)
questionSchema.plugin(mongoosePaginate)
var Questions = module.exports = mongoose.model('questions', questionSchema)