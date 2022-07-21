const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var Drivers = require("./driver")
var Teachers = require("./teacher")
const multer = require("multer")
const cloudinary = require("cloudinary")
const cloudinaryStorage = require("multer-storage-cloudinary"),
    key = 'AIzaSyCMSfq40Bo2KuQvQVSQE1gmmgJdxEbDS0Y',
    NodeGeocoder = require('node-geocoder'),
    options = {
        provider: 'google',
        // Optional depending on the providers
        apiKey: key, // for Mapquest, OpenCage, Google Premier
        formatter: null         // 'gpx', 'string', ...
    },
    geocoder = NodeGeocoder(options)
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
var userSchema = mongoose.Schema({
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
        type : String
    },
    code : String,
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    students : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "students"
    }],
    location : {
        latitude : Number,
        longitude : Number,
        address : String
    },
    changeLocation : {
        type : Boolean,
        default : true
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

userSchema.plugin(mongoosePaginate)
var Users = module.exports = mongoose.model('users', userSchema)

// add new user
module.exports.addNewUser = async (post, files, callBack, callBackRequired, callBackSamePhone, callBackSameEmail) => {
    if (post.phone && post.username) {
        var samePhone = await Users.findOne({"phone.value" : post.phone}).select("phone"),
            sameEmail = {},
            samePhoneTeacher = await Teachers.findOne({"phone.value" : post.phone}).select("phone")
        if (post.email) {
            sameEmail = await Users.findOne({"email" : post.email}).select("email")
        }
        if (samePhone || samePhoneTeacher) {
            callBackSamePhone()
        }else if (sameEmail && sameEmail.email) {
            callBackSameEmail()
        }else {
            var profileImage = ""
            if (files[0]) {
                
                profileImage = `https://res.cloudinary.com/keraapp/image/upload/${files[0].public_id}.${files[0].format}`
            }
    
    
            post.profileImage = profileImage
            post.phone = {
                value : post.phone
            }
            if (post.latitude && post.longitude) {
                var address = await geocoder.reverse({lat:post.latitude, lon:post.longitude})
                post.location = {
                    latitude : Number(post.latitude),
                    longitude : Number(post.longitude),
                    address : address[0].formattedAddress
                }
                post.changeLocation = false
            }
            
            Users(post).save(callBack)
        }
        
    }else {
        callBackRequired()
    }
}

// get users
module.exports.getUsers = (query, page, callback) => {
    var options = {
        page:   page,
        populate : {path : 'lineId', select : 'name'}, 
        limit:    10,
        sort: {
            _id : -1
        }
    }
    Users.paginate(query, options, callback)
}

// edit user
module.exports.editUser = (post, files, id, callback, callBackSamePhone, callBackSameEmail) => {
    Users.findById(id, async (err, user) => {
        if (err) throw err

        var samePhone = {},
            sameEmail = {},
            samePhoneDriver = {},
            samePhoneTeacher = {}

        if (post.phone) {
            samePhone = await Users.findOne({"phone.value" : post.phone, _id : {$ne : user._id}}).select("phone"),
            samePhoneTeacher = await Teachers.findOne({"phone.value" : post.phone}).select("phone")
        }
        
        if (post.email) {
            sameEmail = await Users.findOne({"email" : post.email, _id : {$ne : user._id}}).select("email")
        }
        if (samePhone || samePhoneTeacher) {
            callBackSamePhone()
        }else if (sameEmail && sameEmail.email) {
            callBackSameEmail()
        }else {
            
            if (files[0]) {
                user.profileImage = files[0].url
            }
           
            user.phone = {
                value : post.phone
            }
            user.username = post.username
            
            user.email = post.email
            
            if (post.latitude && post.longitude) {
                var address = await geocoder.reverse({lat:post.latitude, lon:post.longitude})
                user.location = {
                    latitude : Number(post.latitude),
                    longitude : Number(post.longitude),
                    address : address[0].formattedAddress
                }
            }
            
            user.save(callback)
        }
    })    
}

// edit profile image
module.exports.editProfileImage = (post, id, callback, callbackNotUser, callbackRequiredFields) => {
    if (post.image) {
        cloudinary.v2.uploader.upload(post.image, async (err , result)=>{
            if (err) throw err
    
            Users.findById(id, (err, user) => {
                if (err) throw err
    
                if (user) {
                    user.profileImage = result.url
                    user.save(callback)
                }else {
                    callbackNotUser()
                }
            })
        })
    }else {
        callbackRequiredFields()
    }
}