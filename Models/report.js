const mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate')
var reportSchema = mongoose.Schema({
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
    answers : [{
        question : {
            _id : String,
            value : String
        },
        options : [{
            selected : {
                type : Boolean,
                default : false
            },
            value : String,
            icon : String
        }],
        answer : String,
        questionType : Number
    }],
    answersParent : [{
        question : {
            _id : String,
            value : String
        },
        options : [{
            selected : {
                type : Boolean,
                default : false
            },
            value : String,
            icon : String
        }],
        answer : String,
        questionType : Number
    }],
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
    reporttype : {
        type : Number,
        default : 1 // 1 => normal
                    // 2 => absent
    },
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
        type: String
    }
})
reportSchema.plugin(mongoosePaginate)
var Reports = module.exports = mongoose.model('reports', reportSchema)