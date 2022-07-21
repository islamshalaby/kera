const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    fieldsAliasPlugin = require('mongoose-aliasfield')
var newsSchema = mongoose.Schema({
    description_en : {
        type : String,
        alias : 'content'
    },
    description_ar : {
        type : String,
        alias : 'content'
    },
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    date : {
        type : String,
        default: new Date().getTime()
    }
})
newsSchema.plugin(fieldsAliasPlugin)
newsSchema.plugin(mongoosePaginate)
var News = module.exports = mongoose.model('news', newsSchema)