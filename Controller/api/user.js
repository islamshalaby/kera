/**
 * status
 * ------
 * 200 => success
 * 401 => invalid user
 * 403 => required fields
 * 450 => not permitted
 * 408 => user is blocked
 * 406 => email | phone is already exist
 * 409 => no data
 * 
 */
var jwt = require('jsonwebtoken'),
    Users = require('../../Models/user'),
    Drivers = require('../../Models/driver'),
    Lines = require('../../Models/line'),
    Trips = require('../../Models/trip'),
    Teachers = require('../../Models/teacher'),
    Reports = require('../../Models/report'),
    MedicalReport = require('../../Models/medicalReport'),
    ComplaintUsers = require("../../Models/complaintUser"),
    Notifications = require('../../Models/notification'),
    Posts = require('../../Models/post'),
    config = require('config'),
    dbConfig = config.get('Customer'),
    request = require('request'),
    { Client, Location, List, Buttons, LocalAuth } = require('whatsapp-web.js'),
    qrcode = require('qrcode-terminal'),
    mongoose = require('mongoose'),
    Associations = require('../../Models/association'),
    multer = require("multer"),
    post = require('../../Models/post'),
    FCM = require('fcm-node'),
    serverKey = 'AAAAt2s7WE8:APA91bEWFQGzDhGphYFdTY2ld4QBsutpWqWLdohShHCRGk8pqqfgwmbpBS82ntBciwkiLIhwkJREvcgOLVX32irbgjxhgcukpXvwtr_LnVCzDs6EfwqvipV7PbnLBtaVEaoe8p6JhFR_',
    fcm = new FCM(serverKey),
    cloudinary = require("cloudinary"),
    nodemailer = require("nodemailer"),
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

// login
exports.postLogIn = async (req, res) => {
    var post = req.body
    if (post.phone && post.fcmToken) {
        var user = await Users.findOne({"phone.value" : post.phone, deleted : false}).populate([{path : "associationId", select : "username email phone _id"}, {path : "students", populate : {path : "classId", select : "name"}}]),
            teacher = await Teachers.findOne({"phone.value" : post.phone, deleted : false}).populate([{path : "classes", select : "name"}, {path : "associationId", select : "username"}]),
            val = Math.floor(1000 + Math.random() * 9000)

            if (user) {
                if (dbConfig.usersLoginException.includes(user.phone.value)) {
                    user.code = "1234"
                }else {
                    async function main(){
                        let transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: dbConfig.email.user, // generated ethereal user
                                pass: dbConfig.email.password // generated ethereal password
                            }
                        });
                        
                        // send mail with defined transport object
                        let info = {
                            from: `Kera App 👻 <${dbConfig.email.user}>`, // sender address
                            to: user.email, // list of receivers
                            subject: "Kera App Registration ✔", // Subject line
                            text: "Kera App Registration", // plain text body
                            html: `Verfication Code : ${val}` // html body
                        }
                    
                        transporter.sendMail(info, (err, info) => {
                            if (err) {
                                console.log(err)
                            }else {
                                console.log('mail sent successfully')
                            }
                
                        })
                    }
                    main().catch(console.error);
                    
                    user.code = val
                }
                
                
                const token = jwt.sign({
                    userId : user._id
                    },
                    'secret',
                    {}   
                )
    
                user.fcmToken = post.fcmToken
                if (post.deviceType) {
                    user.deviceType = post.deviceType
                }
    
                user.save((err) => {
                    if (err) throw err

                    var latitude = "",
                        longitude = ""
                    if (user.location && user.location.latitude) {
                        latitude = JSON.stringify(user.location.latitude)
                        longitude = JSON.stringify(user.location.longitude)
                    }

                    
                    var students = []
                    if (user.students && user.students.length > 0) {
                        
                        students = user.students.map(function (p) {
                            
                            var student = {
                                username : p.username,
                                studentId : p.studentId,
                                profileImage : p.profileImage,
                                class : p.classId.name
                            }
                            return student
                        })
                        
                    }
                    
                    

                    return res.status(200).json({
                        message : "User is exist",
                        token,
                        type : "user",
                        exist : true,
                        associationId : user.associationId._id,
                        status : 200
                    })
                })
            }else if (teacher){
                if (dbConfig.teachersLoginException.includes(teacher.phone.value)) {
                    teacher.code = "1234"
                }else {
                    async function main(){
                        let transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: dbConfig.email.user, // generated ethereal user
                                pass: dbConfig.email.password // generated ethereal password
                            }
                        });
                        
                        // send mail with defined transport object
                        let info = {
                            from: `Kera App 👻 <${dbConfig.email.user}>`, // sender address
                            to: teacher.email, // list of receivers
                            subject: "Kera App Registration ✔", // Subject line
                            text: "Kera App Registration", // plain text body
                            html: `Verfication Code : ${val}` // html body
                        }
                    
                        transporter.sendMail(info, (err, info) => {
                            if (err) {
                                console.log(err)
                            }else {
                                console.log('mail sent successfully')
                            }
                
                        })
                    }
                    main().catch(console.error);
                    teacher.code = val
                }
                
                const token = jwt.sign({
                    phone : teacher.phone,
                    userId : teacher._id
                    },
                    'secret',
                    {}   
                )

                teacher.fcmToken = post.fcmToken
                if (post.deviceType) {
                    teacher.deviceType = post.deviceType
                }
                teacher.save((err) => {
                    if (err) throw err

                    
                    
                    var data = {
                        _id : teacher._id,
                        email : teacher.email,
                        phoneVerified : teacher.phone.verified,
                        phoneNumber : teacher.phone.value,
                        username : teacher.username,
                        fcmToken : teacher.fcmToken,
                        profileImage : teacher.profileImage,
                        portal : teacher.associationId.username,
                        classes : teacher.classes,
                        blocked : teacher.blocked,
                        type : "teacher"
                    }

                    return res.status(200).json({
                        message : "teacher is exist",
                        token,
                        exist : true,
                        associationId : teacher.associationId._id,
                        type : "teacher",
                        status : 200,
                        data
                    });
                })
            }else {
                return res.status(401).json({
                    message : "User is not exist",
                    exist : false,
                    status : 401
                })
            }
        
    }else {
        return res.status(403).json({
            message : "phone & fcmToken are required",
            status : 405
        })
    }
}

// post check phone verfied
exports.postCheckPhoneVerified = async (req, res) => {
    var post = req.body,
        id = req.userData.userId

    if (post.code && post.phone) {
        var user = await Users.findOne({"phone.value" : post.phone, code : post.code}).select("phone code"),
            teacher = await Teachers.findOne({"phone.value" : post.phone, code : post.code}).select("phone code")
    
            if (user) {
                user.phone.verified = true
                user.code = ""
                
                user.save((err) => {
                    if (err) throw err
    
                    return res.status(200).json({
                        message : "Done successfully",
                        type : "parent",
                        status : 200
                    })
                })
            }else if (teacher) {
                teacher.phone.verified = true
                teacher.code = ""

                teacher.save((err) => {
                    if (err) throw err
    
                    return res.status(200).json({
                        message : "Done successfully",
                        type : "teacher",
                        status : 200
                    })
                })
            }else {
                return res.status(401).json({
                    message : "invalide user",
                    status : 401
                })
            }
    }else {
        return res.status(403).json({
            message : "code & phone required",
            status : 405
        })
    }
    
}

// get profile
exports.getProfile = (req, res) => {
    var id = req.userData.userId
    Users.findById(id).populate([{path : "students", populate : {path : "classId", select : "name"}}, {path : "lineId", select : "name"}, {path : "associationId", select : "_id image"}]).exec((err, user) => {
        if (err) throw err

        if (user) {
            var latitude = "",
                longitude = ""

            if (user.location && user.location.latitude) {
                latitude = JSON.stringify(user.location.latitude)
                longitude = JSON.stringify(user.location.longitude)
            }

            if (user.profileImage.format) {
                var image = user.profileImage.imageId + "." + user.profileImage.format
            }else {
                var image = ""
            }
            var students = []
            if (user.students && user.students.length > 0) {
                
                students = user.students.map(function (p) {
                    // var profileImage = "https://res.cloudinary.com/df0b7ctlg/image/upload/v1584784906/klskq5yjvclxbujz7gxx.png"
                    // if (p.profileImage.imageId) {
                    //     profileImage = 'https://res.cloudinary.com/df0b7ctlg/image/upload/c_scale/' + p.profileImage.imageId + "." + p.profileImage.format
                    // }
                    var student = {
                        username : p.username,
                        studentCode : p.studentId,
                        _id : p._id,
                        profileImage : p.profileImage,
                        classId : p.classId,
                        class : p.classId.name
                    }
                    return student
                })
                
            }
    
            data = {
                username : user.username,
                email : user.email,
                phoneVerified : user.phone.verified,
                phoneNumber : user.phone.value,
                profileImage : user.profileImage,
                associationId : user.associationId._id,
                associationLogo : user.associationId.image,
                blocked : user.blocked,
                location : user.location,
                // changeLocation : user.changeLocation,
                students,
                type : "user"
            }
    
            return res.status(200).json({
                message : "Done successfully",
                status : 200,
                data
            })
        }else {
            return res.status(405).json({
                message : "invalide user",
                status : 401
            })
        }

    })
}

// post update location
exports.postUpdateLocation = (req, res) => {
    var post = req.body,
        id = req.userData.userId

    if (post.associationId && post.lat && post.long) {
        Users.findOne({_id : id, associationId : post.associationId})
        .select("location lineId changeLocation")
        .exec((err, user) => {
            if (err) throw err

            if (user.changeLocation == true) {
                user.location = {
                    latitude : post.lat,
                    longitude : post.long
                }
                user.changeLocation = false
                user.save(async (err) => {
                    if (err) throw err
                    var line = await Lines.findById(user.lineId).select('points'),
                        usersLine = await Users.find({lineId : user.lineId}).select("location")
                    for (var i = 0; i < usersLine.length; i ++) {
                        if (usersLine[i].location.latitude) {
                            line.points.push({
                                "latitude" : usersLine[i].location.latitude,
                                "longitude" : usersLine[i].location.longitude
                            })
                        }
                    }
                    line.save(err => {
                        if (err) throw err
                    })

                    return res.status(200).json({
                        message : "Done successfully",
                        status : 200
                    })
                })
            }else {
                return res.status(450).json({
                    message : "not permitted",
                    status : 450
                })
            }
        })
    }else {
        return res.status(403).json({
            message : "associationId & lat & long are required",
            status : 403
        })
    }
}

// post update profile
exports.postUpdateProfile = (req, res) => {
    var id = req.userData.userId,
        post = req.body

        Users.findById(id, async(err, user) => {
            if (err) throw err
            
            if (user) {
                if (user.blocked == true) {
                    return res.status(408).json({
                        status : 408,
                        message : "User is blocked"
                    })
                }else {
                    if (post.phone) {
                        var samePhone = await Users.findOne({"phone.value" : post.phone, _id : {$ne : user._id}}),
                        samePhoneDriver = await Drivers.findOne({"phone.value" : post.phone}).select("phone"),
                        samePhoneTeacher = await Teachers.findOne({"phone.value" : post.phone}).select("phone")
                        console.log(samePhone)
                        user.phone = {
                            value : post.phone,
                            verified : false
                        }
                    }
                    if (post.email) {
                        var sameEmail = await Users.findOne({email : post.email, _id : {$ne : user._id}})
                        user.email = post.email
                    }
                    if (samePhone || samePhoneDriver || samePhoneTeacher) {
                        return res.status(406).json({
                            message : "phone number is already exist",
                            status : 406
                        })
                    }else if (sameEmail) {
                        return res.status(406).json({
                            message : "email is already exist",
                            status : 406
                        })
                    }else {
                        if (post.username) {
                            user.username = post.username
                        }
                        user.save(err => {
                            if (err) throw err

                            return res.status(200).json({
                                message : "Done successfully",
                                status : 200
                            })
                        })
                    }
                }
            }else {
                return res.status(405).json({
                    message : "invalide user",
                    status : 401
                })
            }
            
    })
}

// post update profile image
exports.postProfileImage = (req, res) => {
    var id = req.userData.userId,
        post = req.body
    
    Users.editProfileImage(post, id, (err) => {
        if (err) throw err

        return res.status(200).json({
            message : "Done successfully",
            status : true
        })
    }, () => {
        return res.status(405).json({
            message : "invalide user",
            status : 401
        })
    }, () => {
        return res.status(403).json({
            message : "image is required",
            status : 403
        })
    })
}

// get available trips
exports.getAvailableTrips = (req, res) => {
    var id = req.userData.userId,
        condition = req.params.condition,
        status = 2

    if (condition == 'available') {
        status = 1
    }
    Users.findById(id).select("associationId").exec((err, user) => {
        if (err) throw err

        if (user) {
            Trips.getTrips(user.associationId, status, async (err, trips) => {
                if (err) throw err

                var trips = trips.map(function (p) {
                    var data = {}
                    if (condition == 'available') {
                        data = {
                            lineName : p.lineId.name,
                            points : p.lineId.points,
                            driverName : p.driver.id.username,
                            driverPhoneNumber : p.driver.id.phone.value,
                            fromAddress : p.start.address,
                            destinationAddress : p.associationId.location.address
                        }
                    }else {
                        var profileImage = "https://res.cloudinary.com/df0b7ctlg/image/upload/v1584784906/klskq5yjvclxbujz7gxx.png"
                        if (p.driver.id.profileImage.imageId) {
                            profileImage = 'https://res.cloudinary.com/df0b7ctlg/image/upload/c_scale/' + p.driver.id.profileImage.imageId + "." + p.driver.id.profileImage.format
                        }
                        var plateNumberType = "",
                            plateNumber = "",
                            rightPlateNumber = "",
                            leftPlateNumber = ""
                        if (p.driver.id.busId.plateNumber) {
                            plateNumberType = "old"
                            plateNumber = p.driver.id.busId.plateNumber
                        }else {
                            plateNumberType = "recent"
                            rightPlateNumber = p.driver.id.busId.rightPlateNumber
                            leftPlateNumber = p.driver.id.busId.leftPlateNumber
                        }
                        data = {
                            driverName : p.driver.id.username,
                            lineName : p.lineId.name,
                            fromAddress : p.start.address,
                            destinationAddress : p.location.address,
                            startTime : p.start.time,
                            reachTime : p.reachTime,
                            driverProfileImage : profileImage,
                            plateNumberType,
                            plateNumber,
                            rightPlateNumber,
                            leftPlateNumber
                        }
                    }
                    

                    return data
                })
    
                
                return res.status(200).json({
                    message : "Done successfully",
                    status : 200,
                    trips
                })
            })
        }else {
            return res.status(405).json({
                message : "invalide user",
                status : 401
            })
        }
        
    })
}

// get current trip
exports.getCurrentTrip = (req, res) => {
    var id = req.userData.userId

    Users.findById(id).select("lineId").exec((err, parent) => {
        if (err) throw err

        if (parent) {
            Trips.findOne({lineId : parent.lineId, status : 1}).populate([{path : "driver.id", select : "profileImage busId phone username", populate : {path : "busId", select : "plateNumber rightPlateNumber leftPlateNumber"}}, {path : "lineId", select : "name"}]).exec((err, trip) => {
                if (err) throw err
    
                if (trip) {
                    
                    var plateNumberType = "recent"
                    
                    if (trip.driver.id.busId.plateNumber) {
                        plateNumberType = "old"
                    }
        
                    if (trip.driver.id.profileImage.format) {
                        var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/" + trip.driver.id.profileImage.imageId + "." + trip.driver.id.profileImage.format
                    }else {
                        var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/v1584784906/klskq5yjvclxbujz7gxx.png"
                    }
                    
                    var data = {
                        tripId : trip._id,
                        driverName : trip.driver.id.username,
                        driverPhoneNumber : trip.driver.id.phone.value,
                        plateNumberType,
                        plateNumber : trip.driver.id.busId.plateNumber,
                        rightPlateNumber : trip.driver.id.busId.rightPlateNumber,
                        leftPlateNumber : trip.driver.id.busId.leftPlateNumber,
                        image,
                        latitude : trip.start.location.latitude,
                        longitude : trip.start.location.longitude,
                        address : trip.start.address,
                        lineName : trip.lineId.name
                    }
        
        
                    return res.status(200).json({
                        message : "Done successfully",
                        status : 200,
                        data
                    })
                }else {
                    return res.status(409).json({
                        message : "no trips",
                        status : 409
                    })
                }
                
            })
        }else {
            return res.status(401).json({
                message : "invalide user",
                status : 401
            })
        }
        
    })
}

// post add complaint
exports.postAddComplaint = (req, res) => {
    var id = req.userData.userId,
        post = req.body

    if (post.description && post.tripId) {
        
        Trips.findById(post.tripId).select("associationId driver").exec((err, trip) => {
            if (err) throw err
            
            post.associationId = trip.associationId
            post.driverId = trip.driver.id
            post.userId = id
            post.time = new Date().getTime()
            
            ComplaintUsers.addNewComplaints(post, (err) => {
                if (err) throw err

                return res.status(200).json({
                    message : "Done successfully",
                    status : 200
                })
            })
        })
        
    }else {
        return res.status(403).json({
            message : "description && tripId are required",
            status : 403
        })
    }
    
}

// get user complaints
exports.getUserComplaints = (req, res) => {
    var id = req.userData.userId

    ComplaintUsers.find({userId : id})
    .populate([{path : "driverId", select : "username profileImage"}, {path : "tripId", select : "lineId _id", populate : {path : "lineId", select : "name"}}])
    .exec((err, data) => {
        if (err) throw err
        
        data = data.map(function (p) {
            if (p.driverId.profileImage.format) {
                var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/" + p.driverId.profileImage.imageId + "." + p.driverId.profileImage.format
            }else {
                var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/v1584784906/klskq5yjvclxbujz7gxx.png"
            }
            complaint = {
                driverName : p.driverId.username,
                driverImage : image,
                lineName : p.tripId.lineId.name,
                description : p.description,
                time : p.time,
                tripId : p.tripId.id
            }
            return complaint
        })
        
        return res.status(200).json({
            message : "Done successfully",
            status : 200,
            data
        })
    })
}

// create post
exports.postCreatePost = (req, res) => {
    var id = req.userData.userId,
        lang = req.params.lang,
        translation = eval(lang)
        post = req.body
    postData = {}
    if (post.image && post.body && post.tagId) {
        cloudinary.v2.uploader.upload(post.image, async (err , result)=>{
            if (err) throw err

            var user = await Users.findById(req.userData.userId).select('associationId username'),
                usersTokens = await Users.find({_id: {$ne : req.userData.userId}}).distinct("fcmToken"),
                teachersTokens = await Teachers.distinct("fcmToken")

            postData = post
            postData.image = {
                imageId : result.public_id,
                format : result.format
            }
    
            postData.body = post.body
            postData.associationId = user.associationId
            postData.tagId = post.tagId
            postData.userId = id

            Posts(postData).save((err, saved) => {
                if (err) throw err

                var message = { 
                    registration_ids: usersTokens,         
                    notification: {
                        title: translation.newPost, 
                        body: user.username + " " + translation.publishedAPost ,
                        sound: "default"
                    },
                    
                    data: { 
                        notificationNumber : '340',
                        postId : saved._id,
                        postBody : saved.body,
                        title: translation.newPost, 
                        body: user.username + " " + translation.publishedAPost
                    }
                };


                fcm.send(message, function(err, response){
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                })

                var message2 = { 
                    registration_ids: teachersTokens,         
                    notification: {
                        title: translation.newPost, 
                        body: user.username + " " + translation.publishedAPost ,
                        sound: "default"
                    },
                    
                    data: { 
                        notificationNumber : '340',
                        postId : saved._id,
                        postBody : saved.body,
                        title: translation.newPost, 
                        body: user.username + " " + translation.publishedAPost
                    }
                };


                fcm.send(message2, function(err, response){
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                })

                return res.status(200).json({
                    message : "Done successfully",
                    status : 200
                })
            })
    
        })
    }else {
        return res.status(403).json({
            message : "image && body && tagId are required",
            status : 403
        })
    }
}

// get user's portal
exports.getUserPortal = async (req, res) => {
    var id = req.userData.userId,
        lang = req.headers.lang,
        user = await Users.findById(id).select('associationId'),
        teacher = await Teachers.findById(id).select('associationId')

    if (!user && !teacher) {
        return res.status(406).json({
            message : "user | teacher not exist",
            status : 406
        })
    }else {
        if (user) {
            var portal = await Associations.findById(user.associationId).populate({path : "type", select : "title"}).select('username slogan type images video image videoImage'),
                videoImage = {
                    link : portal.video,
                    image : portal.videoImage
                },
                images = []
            images.push(videoImage)
            for (var i = 0; i < portal.images.length; i ++) {
                images.push({
                    link : "",
                    image : portal.images[i]
                })
            }
        }else if (teacher) {
            var portal = await Associations.findById(teacher.associationId).populate({path : "type", select : "title"}).select('username slogan type images video image videoImage'),
                videoImage = {
                    link : portal.video,
                    image : portal.videoImage
                },
                images = []
            images.push(videoImage)
            for (var i = 0; i < portal.images.length; i ++) {
                images.push({
                    link : "",
                    image : portal.images[i]
                })
            }
        }
    
        var data = {
            portalName : portal.username,
            slogan : portal.slogan,
            type : portal.type,
            logo : portal.image,
            images : images
        }
            
    
        return res.status(200).json({
            message : "Done successfully",
            status : 200,
            data
        })
    }

    
}

// get user's students
exports.getUserStudents = async (req, res) => {
    var userId = req.userData.userId,
        data = {}
        data = await Users.findById(userId).populate({path : "students", select : "username classId profileImage"}).select('students')

    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })
}

// get daily reports
exports.getDailyReports = async (req, res) => {
    var userId = req.userData.userId,
        studentId = req.params.studentId,
        page = req.params.page,
        filter = req.query,
        options = {
            select : 'teacher answers date',
            populate : [{path : "teacher", select : "profileImage username"}],
            page:   page, 
            limit:    10,
            sort: {
                _id : -1
            }
        }
        console.log(studentId)
        studentId = mongoose.Types.ObjectId(studentId)
        
        query = {students : studentId, status : 3}

        if (filter.fromDate || filter.toDate) {
            var dateTo = "",
                dateFrom = ""
            if (filter.fromDate) {
                dateFrom = new Date(filter.fromDate).getTime()
            }else {
                dateFrom = new Date().getTime()
            }
            if (filter.toDate) {
                dateTo = new Date(filter.toDate).getTime()
            }else {
                dateTo = new Date().getTime()
            }
            query.date = {$gte : dateFrom, $lte : dateTo}
        }
    var reports = await Reports.paginate(query, options)

    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        data : reports
    })
}

// get medical reports
exports.getMedicalReports = async (req, res) => {
    var userId = req.userData.userId,
        studentId = req.params.studentId,
        page = req.params.page,
        filter = req.query,
        options = {
            select : 'teacher question1 question2 images date',
            populate : [{path : "teacher", select : "profileImage username"}],
            page:   page, 
            limit:    10,
            sort: {
                _id : -1
            }
        }
        query = {students : studentId, status : 3}

        if (filter.fromDate || filter.toDate) {
            var dateTo = "",
                dateFrom = ""
            if (filter.fromDate) {
                dateFrom = new Date(filter.fromDate).getTime()
            }else {
                dateFrom = new Date().getTime()
            }
            if (filter.toDate) {
                dateTo = new Date(filter.toDate).getTime()
            }else {
                dateTo = new Date().getTime()
            }
            query.date = {$gte : dateFrom, $lte : dateTo}
        }
    var reports = await MedicalReport.paginate(query, options)

    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        data : reports
    })
}

// get notifications
exports.getNotifications = async (req, res) => {
    var userId = req.userData.userId,
        lang = req.headers.lang,
        page = req.params.page,
        options = {
            select : `title_${lang} body_${lang} date type related icon`,
            page:   page, 
            limit:    5,
            sort: {
                date : -1
            }
        },
        data = await Notifications.paginate({userId : userId}, options)
        data.docs = data.docs.map(function (p) {
            return p.toAliasedFieldsObject()
        })

    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        data : data
    })
}

// post reply
exports.postReply = async (req, res) => {
    var userId = req.userData.userId,
        reply = req.body.reply,
        reportId = req.body.reportId,
        type = req.body.type,
        data = {}

    if (reply && reportId && type) {
        if (type == 'daily') {
            data = await Reports.findById(reportId).select('replies')
        }else {
            data = await MedicalReport.findById(reportId).select('replies')
        }
        var replyObj = {
            parent : userId,
            reply
        }
        data.replies.push(replyObj)

        data.save(err => {
            if (err) throw err
        })

        return res.status(200).json({
            message : "Done successfully",
            status : 200
        })
    }else {
        return res.status(403).json({
            message : "reply && reportId && type are required",
            status : 403
        })
    }
    
}