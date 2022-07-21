const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var applicationSchema = mongoose.Schema({
    student : {
        name : String,
        profileImage : String,
        nationality : String,
        gender : Number, // 1 => male - 2 => female
        birthDate : String
    },
    father : {
        profileImage : String,
        name : String,
        job : String,
        phone : [String]
    },
    mother : {
        profileImage : String,
        name : String,
        job : String,
        phone : [String]
    },
    related : {
        profileImage : String,
        name : String,
        relation : String,
        phone : [String]
    },
    location : {
        latitude : {
            type : Number
        },
        longitude : {
            type : Number
        },
        address : {
            type : String
        }
    },
    medicalHistory : String,
    idImage : String,
    birthImage : String,
    step : Number,  // 1 - 2 - 3 - 4
    udId : String,
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    date : {
        type: String, default: Date.now()
    }
})
applicationSchema.plugin(mongoosePaginate)
var Applications = module.exports = mongoose.model('applications', applicationSchema)