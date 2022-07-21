const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var teacherSchema = mongoose.Schema({
    username : String,
    phone : {
        value : String,
        verified : {
            type : Boolean,
            default : false
        }
    },
    location : {
        latitude : Number,
        longitude : Number,
        address : String
    },
    email : String,
    fcmToken : String,
    code : String,
    specialization : String,
    profileImage : String,
    classes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "classes"
    }],
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    blocked : {
        type : Boolean,
        default : false
    },
    deviceType : {
        type : String   // android
                        // ios
    },
    deleted : {
        type : Boolean,
        default : false
    }
})
teacherSchema.plugin(mongoosePaginate)
var Teachers = module.exports = mongoose.model('teachers', teacherSchema)

// get teachers
module.exports.getTeachers = (query, page, callback) => {
    var options = {
        page:   page,
        limit:    50,
        sort: {
            _id : -1
        }
    }
    Teachers.paginate(query, options, callback)
}