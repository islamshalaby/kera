const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate')
var medicalReportSchema = mongoose.Schema({
    students : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "students"
    }],
    teacher : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "teachers"
    },
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    status : {
        type : Number,
        default : 1
    },  // 1 => created
        // 2 => in progress
        // 3 => published
    comments : [{
        type : String
    }],
    question1 : {
        question : String,
        isYes : {
            type : Boolean,
            default : false
        },
        isNo : {
            type : Boolean,
            default : false
        }
    },
    question2 : {
        question : String,
        answer : String
    },
    sent : {
        type : String,
        default : "all"
    },
    senders : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "users"
        }
    ],
    images : [{
        type : String,
        alias : "images"
    }],
    replies : [
        {
            parent : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "users"
            },
            reply : {
                type : String
            }
        }
    ],
    date : {
        type: String, default: Date.now()
    }
})
medicalReportSchema.plugin(mongoosePaginate)
var MedicalReports = module.exports = mongoose.model('medicalReports', medicalReportSchema)