var Tags = require('../../Models/tag'),
    en = require('../../lang/en'),
    ar = require('../../lang/ar'),
    Contacts = require('../../Models/contact'),
    Settings = require('../../Models/setting'),
    Applications = require('../../Models/application'),
    Attends = require('../../Models/attend'),
    Teachers = require('../../Models/teacher'),
    cloudinary = require("cloudinary"),
    cloudinaryStorage = require("multer-storage-cloudinary")
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
    

// get tags
exports.getTags = (req, res) => {
    var lang = req.params.lang
    Tags.find({deleted : false}).select("title_" + lang).exec((err, data) => {
        if (err) throw err

        data = data.map(function(p){
            return p.toAliasedFieldsObject();
        })

        res.status(200).json({
            message : "done successfully",
            status : 200,
            data
        })
    })
}

// post contact
exports.postContact = (req, res) => {
    var post = req.body

    if (post.associationId) {
        post.contactType = 2
    }
// console.log(req.userData)
    if (req.userData) {
        post.parent = req.userData.userId
    }
    Contacts(post).save(err => {
        if (err) {
            return res.status(406).json({
                message : "faild to save",
                status : 406
            })
        }

        return res.status(200).json({
            message : "Done successfully",
            status : 200
        })
    })
}

// get setting
exports.getSetting = (req, res) => {
    var associationId = req.params.associationId,
        shown = req.params.selected,
        lang = req.headers.lang
        
    Settings.findOne({associationId : associationId}).exec((err, data) => {
        if (err) {
            return res.status(406).json({
                message : "error",
                status : 406
            })
        }
        
        var selected = ""

        if(data) {
            if (lang == "en") {
                if (shown == "terms") {
                    selected = data.terms_en
                }else {
                    selected = data.about_en
                }
            }else {
                if (shown == "terms") {
                    selected = data.terms_ar
                }else {
                    selected = data.about_ar
                }
            }
        }
        
        

        return res.status(200).json({
            message : "Done successfully",
            status : 200,
            data : selected
        })
    })
}

// get association about us
exports.getAppSetting = async (req, res) => {
    var lang = req.params.lang,
        type = req.params.type,
        setting = await Settings.findOne({contactType : 1}),
        data = ""

        data = eval(`setting.${type}_${lang}`)

    res.render("settings", {
        data
    })
}

// get association privacy
exports.getAssociationPrivacy = async (req, res) => {
    var id = req.params.id,
        lang = req.params.lang,
        setting = await Settings.findOne({associationId : id}),
        data = ""

        if (lang == 'en') {
            data = setting.privacy_en
        }else {
            data = setting.privacy_ar
        }
    res.render("privacy", {
        data
    })
}

// post application - step 1
exports.postApplicationStep1 = (req, res) => {
    var post = req.body

    if (post.name && post.nationality && post.gender && post.birthDate, post.associationId && post.udId) {
        if (post.profileImage) {
            cloudinary.v2.uploader.upload(post.profileImage, async (err , result)=>{
                post.student = {
                    name : post.name,
                    profileImage : `https://res.cloudinary.com/keraapp/image/upload/${result.public_id}.${result.format}`,
                    nationality : post.nationality,
                    gender : post.gender,
                    birthDate : post.birthDate
                }
                post.step = 1
                Applications(post).save((err, saved) => {
                    return res.status(200).json({
                        message : "Done successfully",
                        status : 200,
                        applicationId : saved._id
                    })
                })
            })
        }else {
            post.student = {
                name : post.name,
                nationality : post.nationality,
                gender : post.gender,
                birthDate : post.birthDate
            }
            post.step = 1
            Applications(post).save((err, saved) => {
                return res.status(200).json({
                    message : "Done successfully",
                    status : 200,
                    applicationId : saved._id
                })
            })
    
            
        }
    }else {
        return res.status(403).json({
            message : "name & nationality & gender & birthDate & associationId && udId are required",
            status : 403
        })
    }
    
}

// post application - step 2
exports.postApplicationStep2 = async (req, res) => {
    var post = req.body,
        applicationId = post.applicationId

    if ((post.fastherName && post.fatherJob && post.fatherPhones) && applicationId ||
     (post.motherName && post.motherJob && post.motherPhones) && applicationId ||
     (post.relatedName && post.relatedrelation && post.relatedPhones) && applicationId) {
        
        if (post.fastherName && post.fatherJob && post.fatherPhones) {
            if (post.fatherProfileImage) {
                cloudinary.v2.uploader.upload(post.fatherProfileImage, async (err , result)=>{
                    post.father = {
                        profileImage : `https://res.cloudinary.com/keraapp/image/upload/${result.public_id}.${result.format}`,
                        name : post.fastherName,
                        job : post.fatherJob,
                        phone : post.fatherPhones
                    }
                    post.step = 2
                    var application = await Applications.findByIdAndUpdate(applicationId, {$set : post})
                })
            }else {
                post.father = {
                    name : post.fastherName,
                    job : post.fatherJob,
                    phone : post.fatherPhones
                }
                post.step = 2
                var application = await Applications.findByIdAndUpdate(applicationId, {$set : post})
            }
            
        }
        if (post.motherName && post.motherJob && post.motherPhones) {
            if (post.motherProfileImage) {
                cloudinary.v2.uploader.upload(post.motherProfileImage, async (err , result)=>{
                    post.mother = {
                        profileImage : `https://res.cloudinary.com/keraapp/image/upload/${result.public_id}.${result.format}`,
                        name : post.motherName,
                        job : post.motherJob,
                        phone : post.motherPhones
                    }
                    post.step = 2
                    var application = await Applications.findByIdAndUpdate(applicationId, {$set : post})
                })
            }else {
                post.mother = {
                    name : post.motherName,
                    job : post.motherJob,
                    phone : post.motherPhones
                }
                post.step = 2
                var application = await Applications.findByIdAndUpdate(applicationId, {$set : post})
            }
        }
        
        if (post.relatedName && post.relatedrelation && post.relatedPhones) {
            if (post.relatedProfileImage) {
                cloudinary.v2.uploader.upload(post.relatedProfileImage, async (err , result)=>{
                    post.related = {
                        profileImage : `https://res.cloudinary.com/keraapp/image/upload/${result.public_id}.${result.format}`,
                        name : post.relatedName,
                        relation : post.relatedrelation,
                        phone : post.relatedPhones
                    }
                    post.step = 2
                    var application = await Applications.findByIdAndUpdate(applicationId, {$set : post})
                })
            }else {
                post.related = {
                    name : post.relatedName,
                    relation : post.relatedrelation,
                    phone : post.relatedPhones
                }
                post.step = 2
                var application = await Applications.findByIdAndUpdate(applicationId, {$set : post})
            }
        }

        return res.status(200).json({
            message : "Done successfully",
            status : 200
        })
        
    }else {
        return res.status(403).json({
            message : "post.fastherName && post.fatherJob && post.fatherPhone && applicationId || post.motherName && post.motherJob && post.motherPhone && applicationId are required",
            status : 403
        })
    }
    
}

// post application - step 3
exports.postApplicationStep3 = async (req, res) => {
    var post = req.body,
        applicationId = post.applicationId
    if (applicationId) {
        var lat = 0,
            long = 0,
            add = ""
        if (post.latitude) {
            lat = post.latitude
        }

        if (post.longitude) {
            long = post.longitude
        }

        if (post.address) {
            add = post.address
        }
        post.location = {
            latitude : lat,
            longitude : long,
            address : add
        }
        post.step = 3
        console.log(post)
        var application = await Applications.findByIdAndUpdate(applicationId, {$set : post})

        return res.status(200).json({
            message : "Done successfully",
            status : 200
        })
    }else {
        return res.status(403).json({
            message : "applicationId are required",
            status : 403
        })
    }
    
}

// post application - step 4
exports.postApplicationStep4 = async (req, res) => {
    var post = req.body,
        applicationId = post.applicationId
    if (applicationId) {
        if (post.idImage) {
            cloudinary.v2.uploader.upload(post.idImage, async (err , result)=>{
                post.idImage = `https://res.cloudinary.com/keraapp/image/upload/${result.public_id}.${result.format}`,
                post.step = 4
                var application = await Applications.findByIdAndUpdate(applicationId, {$set : post})
            })
        }

        if (post.birthImage) {
            cloudinary.v2.uploader.upload(post.birthImage, async (err , result)=>{
                
                post.birthImage = `https://res.cloudinary.com/keraapp/image/upload/${result.public_id}.${result.format}`,
                 
                post.step = 4
                var application = await Applications.findByIdAndUpdate(applicationId, {$set : post})
            })
        }

        if (!post.idImage && !post.birthImage) {
            post.step = 4
            var application = await Applications.findByIdAndUpdate(applicationId, {$set : post})
        }

        return res.status(200).json({
            message : "Done successfully",
            status : 200
        })
    }else {
        return res.status(403).json({
            message : "applicationId are required",
            status : 403
        })
    }
    
}

// check application step
exports.checkApplicationStep = async (req, res) => {
    var udId = req.headers.udid,
        application = await Applications.findOne({udId : udId, step : {"$in" : [1, 2, 3]}})

    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        application
    })
}

// get arrival qrcode data
exports.getArrivalQrCode = async (req, res) => {
    var code = req.headers.code,
        teacherId = req.userData.userId,
        teacher = await Teachers.findById(teacherId).select('associationId')
    if (teacher) {
        var setting = await Settings.findOne({associationId : teacher.associationId, arrivalQr : code}).select('arrivalQr')

        if (setting) {
            var now = new Date(),
                formattedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                attend = await Attends.findOne({associationId : teacher.associationId, teacher : teacherId, formattedDate: {$gte: formattedDate}})
            if (attend) {
                return res.status(406).json({
                    message : "arrived before",
                    status : 406
                })
            }else {
                var data = {
                    teacher : teacherId,
                    associationId : teacher.associationId,
                    arrivalTime : new Date().getTime()
                }
    
                Attends(data).save()
    
                return res.status(200).json({
                    message : "Done successfully",
                    status : 200
                })
            }
            
        }else {
            return res.status(406).json({
                message : "not authorized",
                status : 406
            })
        }
    }else {
        return res.status(406).json({
            message : "no teacher",
            status : 406
        })
    }
}

// get departure qrcode data
exports.getDepartureQrCode = async (req, res) => {
    var code = req.headers.code,
        teacherId = req.userData.userId,
        teacher = await Teachers.findById(teacherId).select('associationId')
    if (teacher) {
        var setting = await Settings.findOne({associationId : teacher.associationId, departureQr : code}).select('departureQr')

        if (setting) {
            var now = new Date(),
                formattedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                attend = await Attends.findOne({associationId : teacher.associationId, teacher : teacherId, formattedDate: {$gte: formattedDate}})
            if (attend) {
                attend.departureTime = Date.now()
                attend.save()

                return res.status(200).json({
                    message : "Done successfully",
                    status : 200
                })
            }else {
                return res.status(406).json({
                    message : "not arrived yet",
                    status : 406
                })
            }

            
        }else {
            return res.status(406).json({
                message : "not authorized",
                status : 406
            })
        }
    }else {
        return res.status(406).json({
            message : "no teacher",
            status : 406
        })
    }
}

// get qrcode data
exports.getQrCode = async (req, res) => {
    var code = req.body.code,
        teacherId = req.userData.userId,
        teacher = await Teachers.findById(teacherId).select('associationId')
    if (teacher) {
        var settingArrival = await Settings.findOne({associationId : teacher.associationId, arrivalQr : code}).select('arrivalQr'),
            settingDeparture = await Settings.findOne({associationId : teacher.associationId, departureQr : code}).select('departureQr')
        
        if (settingArrival) {
            var now = new Date(),
                formattedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                attend = await Attends.findOne({associationId : teacher.associationId, teacher : teacherId, formattedDate: {$gte: formattedDate}})
            if (attend) {
                return res.status(406).json({
                    message : "arrived before",
                    status : 406
                })
            }else {
                var data = {
                    teacher : teacherId,
                    associationId : teacher.associationId,
                    arrivalTime : new Date().getTime()
                }
    
                Attends(data).save()
    
                return res.status(200).json({
                    message : "Done successfully",
                    status : 200
                })
            }
            
        }else if(settingDeparture){
            var now = new Date(),
                formattedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                attend = await Attends.findOne({associationId : teacher.associationId, teacher : teacherId, formattedDate: {$gte: formattedDate}})
            if (attend && !attend.departureTime) {
                attend.departureTime = Date.now()
                attend.save()

                return res.status(200).json({
                    message : "Done successfully",
                    status : 200
                })
            }else {
                return res.status(406).json({
                    message : "not arrived yet or set departure time before",
                    status : 406
                })
            }
        }else {
            return res.status(406).json({
                message : "not authorized",
                status : 406
            })
        }
    }else {
        return res.status(406).json({
            message : "no teacher",
            status : 406
        })
    }
}

// get attendance dates
exports.getAttendanceDates = async (req, res) => {
    var data = await Attends.find({teacher : req.userData.userId}).distinct('date')

    res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })
}

// get attendance data
exports.getAttendanceData = async (req, res) => {
    var page = req.params.page,
        options = {
            select : `arrivalTime departureTime date`,
            page:   page, 
            limit:    5,
            sort: {
                _id : -1
            }
        },
        filter = req.query,
        query = {
            teacher : req.userData.userId
        }
    if (filter.fromDate || filter.toDate) {
        var dateTo = "",
            dateFrom = ""
        if (filter.fromDate) {
            dateFrom = new Date(filter.fromDate).getTime()
            console.log("sss")
        }else {
            dateFrom = new Date().getTime()
        }
        if (filter.toDate) {
            dateTo = new Date(filter.toDate).getTime()
            console.log("ttt")
        }else {
            dateTo = new Date().getTime()
        }
        if (filter.fromDate == filter.toDate) {
            var date = new Date(filter.toDate),
                newDate = date.setDate(date.getDate() + 86400000)
            dateTo = newDate
        }
        query.date = {$gte : dateFrom, $lte : dateTo}
        
    }

    var data = await Attends.paginate(query, options)

    res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })
}