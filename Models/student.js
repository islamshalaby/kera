const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true);
var mongoosePaginate = require('mongoose-paginate')
const AutoIncrement = require('mongoose-sequence')(mongoose)

var studentSchema = mongoose.Schema({
    username : String,
    // studentId : String,
    profileImage : String,
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    classId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "classes"
    },
    deleted : {
        type : Boolean,
        default : false
    },
    parentId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users"
    }
})
studentSchema.plugin(AutoIncrement, {inc_field: 'studentId'})
studentSchema.plugin(mongoosePaginate)
var Students = module.exports = mongoose.model('students', studentSchema)

// add new student
module.exports.addNewStudent = (post, files, callBackRequired, callBack) => {
    if (post.username && post.classId && post.parentId && files[0]) {
        post.profileImage = `https://res.cloudinary.com/keraapp/image/upload/${files[0].public_id}.${files[0].format}`
        
        var student = new Students(post)
        student.save(callBack)
    }else {
        callBackRequired()
    }
}

// get students
module.exports.getStudents = (query, page, callback) => {
    var options = {
        page:   page,
        populate : {path : 'parentId', select : 'username'}, 
        limit:    10,
        sort: {
            _id : -1
        }
    }
    Students.paginate(query, options, callback)
}

// edit student
module.exports.editStudent = (id, post, files, callBack) => {
    if (files[0]) {
        post.profileImage = `https://res.cloudinary.com/keraapp/image/upload/${files[0].public_id}.${files[0].format}`
    }
    
    Students.findByIdAndUpdate(id, {$set : post}, callBack)
}