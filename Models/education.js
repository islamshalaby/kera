const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate'),
    fieldsAliasPlugin = require('mongoose-aliasfield')

var educationSchema = mongoose.Schema({
    title_en : {
        type : String,
        alias : "title"
    },
    title_ar : {
        type : String,
        alias : "title"
    },
    description_en : {
        type : String,
        alias : "description"
    },
    description_ar : {
        type : String,
        alias : "description"
    },
    short_description_en : {
        type : String,
        alias : "shortDescription"
    },
    short_description_ar : {
        type : String,
        alias : "shortDescription"
    },
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    images : [{
        type : String,
        alias : "images"
    }],
    class : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "classes"
    },
    edDate : {
        type : String,
        alias : "date"
    }
})
educationSchema.plugin(mongoosePaginate)
educationSchema.plugin(fieldsAliasPlugin)
var Educations = module.exports = mongoose.model('educations', educationSchema)