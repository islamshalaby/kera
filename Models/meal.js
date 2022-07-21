const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate'),
    fieldsAliasPlugin = require('mongoose-aliasfield')

var mealSchema = mongoose.Schema({
    title_en : {
        type : String,
        alias : "title"
    },
    title_ar : {
        type : String,
        alias : "title"
    },
    meal_name_en : {
        type : String,
        alias : "mealName"
    },
    meal_name_ar : {
        type : String,
        alias : "mealName"
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
    mainImage : {
        type : String,
        alias : "mainCover"
    },
    tinyImage : {
        type : String,
        alias : "smallImage"
    },
    class : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "classes"
    },
    comments : [{
        content : {
            type : String,
            alias : "text"
        },
        date : {
            type : String,
            alias : "commentDate"
        },
        publisher : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "users"
        },
        student : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "students"
        }
    }],
    mealDate : {
        type : String,
        alias : "date"
    }
})
mealSchema.plugin(mongoosePaginate)
mealSchema.plugin(fieldsAliasPlugin)
var Meals = module.exports = mongoose.model('meals', mealSchema)