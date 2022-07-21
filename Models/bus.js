const mongoose = require('mongoose')
var busSchema = mongoose.Schema({
    plateNumber : String,
    rightPlateNumber : String,
    leftPlateNumber : String,
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    driverId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "drivers"
    },
    deleted : {
        type : Boolean,
        default : false
    }
})
var Buses = module.exports = mongoose.model('buses', busSchema)