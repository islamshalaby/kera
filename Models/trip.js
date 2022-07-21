const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var tripSchema = mongoose.Schema({
    driver : {
        name : String,
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "drivers"
        }
    },
    users : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "users"
    }],
    lineId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "lines"
    },
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    start : {
        location : {
            latitude : Number,
            longitude : Number
        },
        address : String,
        time : String
    },
    tripRoute : [],
    reachTime : String,
    location : {
        latitude : Number,
        longitude : Number,
        address : String
    },
    status : Number     // 1 => current trips
                        // 2 => completed trips
})

tripSchema.plugin(mongoosePaginate)
var Trips = module.exports = mongoose.model('trips', tripSchema)

// get trips
module.exports.getTrips = (associationId, status, callBack) => {
    var today = new Date(),
        beforeSeven = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000))
        // , "start.time" : {$gte : beforeSeven.getTime(), $lte : today.getTime()}
    Trips
    .find({associationId : associationId, status : status})
    .populate([{path : "lineId", select : "name points"}, {path : "driver.id", select : "username phone profileImage busId", populate : {path : "busId", select : "plateNumber rightPlateNumber leftPlateNumber"}}, {path : "associationId", select : "location"}])
    .exec(callBack)
}