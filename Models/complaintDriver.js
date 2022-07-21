const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var complaintDriverSchema = mongoose.Schema({
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
    time : String
})
complaintDriverSchema.plugin(mongoosePaginate)
var ComplaintDrivers = module.exports = mongoose.model('complaintDrivers', complaintDriverSchema)

// add new class
module.exports.addNewComplaints = (post, callBack) => {
    ComplaintDrivers(post).save(callBack)
}