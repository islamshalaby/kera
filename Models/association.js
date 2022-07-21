var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    fieldsAliasPlugin = require('mongoose-aliasfield'),
    mongoosePaginate = require('mongoose-paginate'),
    key = 'AIzaSyCMSfq40Bo2KuQvQVSQE1gmmgJdxEbDS0Y',
    NodeGeocoder = require('node-geocoder'),
    options = {
        provider: 'google',
        // Optional depending on the providers
        apiKey: key, // for Mapquest, OpenCage, Google Premier
        formatter: null         // 'gpx', 'string', ...
    },
    geocoder = NodeGeocoder(options)

var associationSchema = mongoose.Schema({
    email : String,
    phone : [{
        type : String
    }],
    username : String,
    slogan : String,
    password : String,
    video : String,
    location : {
        latitude : {
            type : Number,
            alias : 'latitude'
        },
        longitude : {
            type : Number,
            alias : 'longitude'
        },
        address : {
            type : String,
            alias : 'address'
        }
    },
    days : [{
        type : {
            type : String,
            alias : 'dayType'
        }
    }],
    image : {
        type : String,
        alias : 'logo'
    },
    videoImage : {
        type : String,
        alias : 'videoThumbnail'
    },
    images : [
        {
            type : String,
            alias : 'images'
        }
    ],
    type : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "types"
    },
    blocked : {
        type : Boolean,
        default : false
    },
    accepted : {
        type : Boolean,
        default : false
    },
    favorites : {
        type : Number,
        default : 0
    },
    favoritUsers : [String],
    description_en : {
        type : String,
        alias : 'description'
    },
    description_ar : {
        type : String,
        alias : 'description'
    },
    short_description_en : {
        type : String,
        alias : 'shortDescription'
    },
    short_description_ar : {
        type : String,
        alias : 'shortDescription'
    },
    tags : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "tags",
            alias : "tag"
        }
    ],
    authType : {
        type : Number,
        default : 2 // 1 => super admin
                    // 2 => association
    } 

})

associationSchema.plugin(fieldsAliasPlugin)
associationSchema.plugin(mongoosePaginate)
var Associations = module.exports = mongoose.model('associations', associationSchema)

// get Associations
module.exports.getAssociations = (cols, page, callback, query = {}) => {
    var options = {
        select : cols,
        page:   page, 
        limit:    50,
        sort: {
            _id : -1
        }
    }
    Associations.paginate(query, options, callback)
}

// compare password
module.exports.comparePassword = (candidatePassword , hash , callback)=>{
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) throw err
        callback(null , isMatch)
    });
}

// add admin
module.exports.addAdmin = (data, callback, callback2, samePhoneCallback, sameEmailCallback, sameUsernameCallback, files) => {
    bcrypt.genSalt(10, function(err, salt) {
        if (err) throw err
        
        bcrypt.hash(data.password, salt, async(err, hash) => {
            if (err) throw err
            
            if (data.email && data.phone && data.password && data.username  && data.type && data.long && data.lat) {
                var adminWithSamePhone = await Associations.findOne({phone : data.phone}),
                    adminWithSameEmail = await Associations.findOne({email : data.email}),
                    adminWithSameUsername = await Associations.findOne({username : data.username}),
                    address = await geocoder.reverse({lat:data.lat, lon:data.long}),
                    image = "",
                    videoImage = "",
                    images = [];
                    location = {
                        latitude : data.lat,
                        longitude : data.long,
                        address : address[0].formattedAddress
                    }

                    if (files && files.length > 0) {
                        for (var i =0; i < files.length; i ++) {
                            if (files[i].fieldname == 'videoImage') {
                                videoImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                            }
                            if (files[i].fieldname == 'image') {
                                image = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                            }
                            var singleImage = ""
                            if (files[i].fieldname == 'images') {
                                singleImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                                images.push(singleImage)
                            }
                        }
                    }

                if (adminWithSamePhone) {
                    samePhoneCallback()
                }else if(adminWithSameEmail) {
                    sameEmailCallback()
                }else if(adminWithSameUsername) {
                    sameUsernameCallback()
                }else {
                    var admin = new Associations({
                        email : data.email,
                        username : data.username,
                        password : hash,
                        phone : data.phone,
                        location : location,
                        type : data.type,
                        tags : data.tags,
                        accepted : true,
                        description_en : data.description_en,
                        description_ar : data.description_ar,
                        short_description_en : data.short_description_en,
                        short_description_ar : data.short_description_ar,
                        videoImage,
                        image,
                        images
                    })
                    
        
                    admin.save(err => {
                        if (err) throw err
        
                        callback()
                    })
                }
                
            }else {
                callback2()
            }
        })
    })
}

// get admin by username or phone or email
module.exports.getAdminByUsernameOrPhoneOrEmail = (key, callback) => {
    var query = {
        $or: [
          { username : key },
          { phone: key },
          { email: key }
        ]
      }

    Associations.findOne(query, callback)
}

module.exports.getSuperAdminByUsernameOrPhoneOrEmail = (key, callback) => {
    var query = {
        $or: [
          { username : key },
          { phone: key },
          { email: key }
        ],
        authType : 1
      }

    Associations.findOne(query, callback)
}

// compare password
module.exports.comparePassword = (candidatePassword , hash , callback)=>{
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) throw err
        callback(null , isMatch)
    });
}

// edit admin
module.exports.editAdmin = (id, data, files, callback) => {
    Associations.findById(id, async (err, admin) => {
        if (err) throw err

        if (data.password) {
            bcrypt.genSalt(10, function(err, salt) {
                if (err) throw err
                bcrypt.hash(data.password, salt, async (err, hash) => {
                    if (err) throw err
        
                    admin.password = hash
                    if (data.username) {
                        var sameUsername = await Associations.findOne({_id : {$ne : id}, username : data.username})
                        if (!sameUsername) {
                            admin.username = data.username
                        }
                    }
                    if(data.email){
                        var sameEmail = await Associations.findOne({_id : {$ne : id}, email : data.email})
                        if (!sameEmail) {
                            admin.email = data.email
                        }
                    }
                    if (data.phone) {
                        var samePhone = await Associations.findOne({_id : {$ne : id}, phone : data.phone})
                        if (!samePhone) {
                            admin.phone = data.phone
                        }
                    }
                    var image = "",
                    videoImage = "",
                        images = admin.images
                    if (files && files.length > 0) {
                        for (var i =0; i < files.length; i ++) {
                            if (files[i].fieldname == 'image') {
                                image = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                            }else {
                                image = admin.image
                            }
                            if (files[i].fieldname == 'videoImage') {
                                videoImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                            }else {
                                videoImage = admin.videoImage
                            }
                            var singleImage = ""
                            if (files[i].fieldname == 'images') {
                                singleImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                                images.push(singleImage)
                            }
                        }
                        
                        admin.image = image
                        admin.videoImage = videoImage;
                        admin.images = images
                    }
                    

                    if ((data.lat && data.long) && (data.lat != admin.location.latitude && data.long != admin.location.longitude)) {
                        address = await geocoder.reverse({lat:data.lat, lon:data.long})
                        admin.location = {
                            latitude : data.lat,
                            longitude : data.long,
                            address : address[0].formattedAddress
                        }
                    }
                    if (data.type) {
                        admin.type = data.type
                    }

                    if (data.tags) {
                        admin.tags = data.tags
                    }

                    if (data.description_en) {
                        admin.description_en = data.description_en
                    }

                    if (data.description_ar) {
                        admin.description_ar = data.description_ar
                    }

                    if (data.short_description_en) {
                        admin.short_description_en = data.short_description_en
                    }

                    if (data.short_description_ar) {
                        admin.short_description_ar = data.short_description_ar
                    }
        
                    admin.save(err => {
                        if (err) throw err
        
                        callback()
                    })
                })
            })
        }else {
            
            admin.password = admin.password
            if (data.username) {
                var sameUsername = await Associations.findOne({_id : {$ne : id}, username : data.username})
                if (!sameUsername) {
                    admin.username = data.username
                }
            }
            if(data.email){
                var sameEmail = await Associations.findOne({_id : {$ne : id}, email : data.email})
                if (!sameEmail) {
                    admin.email = data.email
                }
            }
            if (data.phone) {
                var samePhone = await Associations.findOne({_id : {$ne : id}, phone : data.phone})
                if (!samePhone) {
                    admin.phone = data.phone
                }
            }
            var image = "",
                videoImage = "",
                images = admin.images
            if (files && files.length > 0) {
                for (var i =0; i < files.length; i ++) {
                    if (files[i].fieldname == 'image') {
                        image = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                    }else {
                        image = admin.image
                    }
                    if (files[i].fieldname == 'videoImage') {
                        videoImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                    }else {
                        videoImage = admin.videoImage
                    }
                    var singleImage = ""
                    if (files[i].fieldname == 'images') {
                        singleImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                        images.push(singleImage)
                    }
                }
                
                admin.image = image
                admin.videoImage = videoImage
                admin.images = images
            }

            if ((data.lat && data.long) && (data.lat != admin.location.latitude && data.long != admin.location.longitude)) {
                address = await geocoder.reverse({lat:data.lat, lon:data.long})
                admin.location = {
                    latitude : data.lat,
                    longitude : data.long,
                    address : address[0].formattedAddress
                }
            }
            if (data.type) {
                admin.type = data.type
            }

            if (data.tags) {
                admin.tags = data.tags
            }

            if (data.description_en) {
                admin.description_en = data.description_en
            }

            if (data.description_ar) {
                admin.description_ar = data.description_ar
            }

            if (data.short_description_en) {
                admin.short_description_en = data.short_description_en
            }

            if (data.short_description_ar) {
                admin.short_description_ar = data.short_description_ar
            }

            admin.save(err => {
                if (err) throw err

                callback()
            })
        }
    })
}
