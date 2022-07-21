const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var complaintUserSchema = mongoose.Schema({
    description : String,
    driverId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "drivers"
    },
    tripId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "trips"
    },
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users"
    },
    time : String
})
complaintUserSchema.plugin(mongoosePaginate)
var ComplaintUsers = module.exports = mongoose.model('complaintUsers', complaintUserSchema)

// add new class
module.exports.addNewComplaints = (post, callBack) => {
    ComplaintUsers(post).save(callBack)
}