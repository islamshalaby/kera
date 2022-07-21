const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var settingSchema = mongoose.Schema({
    about_en : String,
    about_ar : String,
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    terms_en : String,
    terms_ar : String,
    privacy_en : String,
    privacy_ar : String,
    arrivalQr : {
        type: String,
        default : "test"
    },
    departureQr : {
        type: String,
        default : "test"
    },
    contactType : {
        type : Number,
        default : 1 // 2 => association
                    // 1 => app
    }
})

settingSchema.plugin(mongoosePaginate)
var Settings = module.exports = mongoose.model('settings', settingSchema)