const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate'),
    fieldsAliasPlugin = require('mongoose-aliasfield')

var eventSchema = mongoose.Schema({
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
    short_description_en :{
        type : String,
        alias : "shortDescription"
    },
    short_description_ar :{
        type : String,
        alias : "shortDescription"
    },
    images : [{
        type : String,
        alias : "images"
    }],
    link : {
        type : String,
        alias : "imagesLink"
    },
    mainImage : {
        type : String,
        alias : "mainCover"
    },
    location : {
        latitude : {
            type : Number,
            alias : 'latitude'
        },
        longitude : {
            type : Number,
            alias : 'longitude'
        },
        address : {
            type : String,
            alias : 'address'
        }
    },
    students : [{
        student : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "students"
        },
        accept : {
            type : Boolean,
            default : false,
            alias : "attend"
        }
    }],
    price : {
        type : Number,
        alias : 'eventPrice'
    },
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    eventType : {
        type : String,  // 1 => upcoming
                        // 2 => previous
        alias : 'type',
        default : "upcoming"
    },
    date : {
        type : Date,
        alias : 'eventDate'
    },
    from : {
        type : String,
        alias : 'fromTime'
    },
    to : {
        type : String,
        alias : 'toTime'
    },
    deleted : {
        type : Boolean,
        default : false
    }
}, { timestamps: true })
eventSchema.plugin(mongoosePaginate)
eventSchema.plugin(fieldsAliasPlugin)
var Events = module.exports = mongoose.model('events', eventSchema)