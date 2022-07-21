const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
const multer = require("multer")
const cloudinary = require("cloudinary")
const cloudinaryStorage = require("multer-storage-cloudinary")
cloudinary.config({
    cloud_name: "keraapp",
        api_key: "231568174267139",
        api_secret: "26o71Dy4iaDXYJQvVNtSJ-Rd53E"
});
const storage = cloudinaryStorage({
        cloudinary: cloudinary,
        allowedFormats: ["jpg", "png"],
        // transformation: [{ width: 1680, height: 600, crop: "scale" }]
});
var driverSchema = mongoose.Schema({
    email : String,
    phone : {
        value : String,
        verified : {
            type : Boolean,
            default : false
        }
    },
    fcmToken : String,
    username : String,
    profileImage : {
        imageId : String,
        format : String
    },
    lineId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "lines"
    },
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    busId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "buses"
    },
    blocked : {
        type : Boolean,
        default : false
    }
})

driverSchema.plugin(mongoosePaginate)
var Drivers = module.exports = mongoose.model('drivers', driverSchema)

// get drivers
module.exports.getDrivers = (query, page, callback) => {
    var options = {
        page:   page,
        populate : {path : 'lineId', select : 'name'}, 
        limit:    50,
        sort: {
            _id : -1
        }
    }
    Drivers.paginate(query, options, callback)
}

// edit profile image
module.exports.editProfileImage = (post, id, callback, callbackNotUser, callbackRequiredFields) => {
    if (post.image) {
        cloudinary.v2.uploader.upload(post.image, async (err , result)=>{
            if (err) throw err
    
            Drivers.findById(id, (err, driver) => {
                if (err) throw err
    
                if (driver) {
                    driver.profileImage = {
                        imageId : result.public_id,
                        format : result.format
                    }
                    driver.save(callback)
                }else {
                    callbackNotUser()
                }
            })
        })
    }else {
        callbackRequiredFields()
    }
}