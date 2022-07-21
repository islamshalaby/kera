const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
const multer = require("multer")
const cloudinary = require("cloudinary")
const cloudinaryStorage = require("multer-storage-cloudinary")
const { post } = require('../Routes/admin')
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

var postSchema = mongoose.Schema({
    body : String,
    image : {
        imageId : String,
        format : String
    },
    tagId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "tags"
    },
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    teacherId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "teachers"
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users"
    },
    likes : Number,
    date : {
        type : String,
        default : Date.now()
    }
})

postSchema.plugin(mongoosePaginate)
Posts = module.exports = mongoose.model('posts', postSchema)

