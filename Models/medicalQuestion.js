const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    fieldsAliasPlugin = require('mongoose-aliasfield')
var medicalQuestionSchema = mongoose.Schema({
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
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    deleted : {
        type : Boolean,
        default : false
    }
})
medicalQuestionSchema.plugin(fieldsAliasPlugin)
medicalQuestionSchema.plugin(mongoosePaginate)
var MedicalQuestions = module.exports = mongoose.model('medicalQuestions', medicalQuestionSchema)