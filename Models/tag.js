const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    fieldsAliasPlugin = require('mongoose-aliasfield')
var tagSchema = mongoose.Schema({
    title_en : {
        type : String,
        alias : 'name'
    },
    title_ar : {
        type : String,
        alias : 'name'
    },
    deleted : {
        type : Boolean,
        default : false
    }
})
tagSchema.plugin(fieldsAliasPlugin)
tagSchema.plugin(mongoosePaginate)
var Tags = module.exports = mongoose.model('tags', tagSchema)
