/**
 * status
 * ------
 * 200 => success
 * 401 => invalid user
 * 403 => required fields
 * 450 => not permitted
 * 408 => user is blocked
 * 406 => email | phone is already exist
 * 410 => there is no trip
 * 412 => invalid trip
 * 
 * -------------------------------------
 * notification
 * ------------
 * 300 => trip started
 * 310 => driver approached user
 * 320 => trip starts soon
 */
var Drivers = require('../../Models/driver'),
    Trips = require('../../Models/trip'),
    Parents = require("../../Models/user"),
    Teachers = require("../../Models/teacher"),
    Lines = require("../../Models/line"),
    ComplaintDraivers = require("../../Models/complaintDriver")
    en = require('../../lang/en'),
    ar = require('../../lang/ar'),
    FCM = require('fcm-node'),
    serverKey = 'AAAAszCrw1w:APA91bF7J9b-Kk2Xxp_AaYQ27O-X4ABqvTL83tw5z-3EiNJ6aPQWIYrQiOEDgqkTBhhUZ01hEXkSYIzvaRx3mg5dO39569WoIhXtdnqwAcjweTtVeMYEK67ujtBaqIwLFQvx1rZ7MjYp',
    fcm = new FCM(serverKey),
    schedule = require('node-schedule'),
    key = 'AIzaSyCMSfq40Bo2KuQvQVSQE1gmmgJdxEbDS0Y',
    NodeGeocoder = require('node-geocoder'),
    options = {
        provider: 'google',
        // Optional depending on the providers
        apiKey: key, // for Mapquest, OpenCage, Google Premier
        formatter: null         // 'gpx', 'string', ...
      },
    geocoder = NodeGeocoder(options),
    geolib = require('geolib')
    matrix = require('google-distance-matrix')
    matrix.key(key)
    matrix.mode('driving')
    matrix.units('imperial')

// post check phone verfied
exports.postCheckPhoneVerified = (req, res) => {
    var id = req.userData.userId

    Drivers.findById(id).select("phone").exec((err, driver) => {
        if (err) throw err

        if (driver) {
            driver.phone.verified = true
            
            driver.save((err) => {
                if (err) throw err

                return res.status(200).json({
                    message : "Done successfully",
                    status : 200
                })
            })
        }else {
            return res.status(401).json({
                message : "invalide driver",
                status : 401
            })
        }
    })
}

// get profile
exports.getProfile = (req, res) => {
    var id = req.userData.userId
    Drivers.findById(id).populate([{path : "busId", select : "plateNumber rightPlateNumber leftPlateNumber"}, {path : "lineId", select : "name"}]).exec((err, driver) => {
        if (err) throw err

        if (driver) {

            if (driver.profileImage.format) {
                var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/" + driver.profileImage.imageId + "." + driver.profileImage.format
            }else {
                var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/v1584784906/klskq5yjvclxbujz7gxx.png"
            }
            var busNumber = "",
                busRightNumber = "",
                busLeftNumber = "",
                plateNumberType = ""

            if (driver.busId.busNumber) {
                plateNumberType = "old"
                busNumber = driver.busId.busNumber
            }else {
                plateNumberType = "recent"
                busRightNumber = driver.busId.rightPlateNumber
                busLeftNumber = driver.busId.leftPlateNumber
            }
    
            data = {
                username : driver.username,
                email : driver.email,
                phoneVerified : driver.phone.verified,
                phoneNumber : driver.phone.value,
                profileImage : image,
                associationId : driver.associationId,
                blocked : driver.blocked,
                plateNumberType,
                busNumber,
                busRightNumber,
                busLeftNumber,
                lineName : driver.lineId.name,
                type : "driver"
            }
    
            return res.status(200).json({
                message : "Done successfully",
                status : 200,
                data
            })
        }else {
            return res.status(405).json({
                message : "invalide driver",
                status : 401
            })
        }

    })
}

// post update profile
exports.postUpdateProfile = (req, res) => {
    var id = req.userData.userId,
        post = req.body

    Drivers.findById(id, async(err, driver) => {
        if (err) throw err

        if (driver) {
            var samePhone = {},
            sameEmail = {},
            samePhoneParent = {},
            samePhoneTeacher = {}

            if (post.phone) {
                samePhone = await Drivers.findOne({"phone.value" : post.phone, _id : {$ne : driver._id}}).select("phone"),
                samePhoneParent = await Parents.findOne({"phone.value" : post.phone}).select("phone"),
                samePhoneTeacher = await Teachers.findOne({"phone.value" : post.phone}).select("phone")
            }

            if (post.email) {
                sameEmail = await Drivers.findOne({email : post.email, _id : {$ne : driver._id}}).select("email") 
            }

            if ((samePhone && samePhone.phone) || (samePhoneParent && samePhoneParent.phone) || (samePhoneTeacher && samePhoneTeacher.phone)) {
                return res.status(406).json({
                    message : "phone number is already exist",
                    status : 406
                })
            }else if (sameEmail && sameEmail.email) {
                return res.status(406).json({
                    message : "email is already exist",
                    status : 406
                })
            }else {
                if (driver.blocked == true) {
                    return res.status(408).json({
                        status : 408,
                        message : "Driver is blocked"
                    })
                }else {
                    if (post.phone) {
                        var samePhone = await Drivers.findOne({"phone.value" : post.phone, _id : {$ne : driver._id}})
                        driver.phone = {
                            value : post.phone,
                            verified : false
                        }
                    }
                    if (post.email) {
                        var sameEmail = await Drivers.findOne({email : post.email, _id : {$ne : driver._id}})
                        driver.email = post.email
                    }
                    if (samePhone) {
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
                            driver.username = post.username
                        }
                        driver.save(err => {
                            if (err) throw err

                            return res.status(200).json({
                                message : "Done successfully",
                                status : 200
                            })
                        })
                    }
                }
            }
        }else {
            return res.status(405).json({
                message : "invalide driver",
                status : 405
            })
        }
    })
}

// post update profile image
exports.postProfileImage = (req, res) => {
    var id = req.userData.userId,
        post = req.body
    
    Drivers.editProfileImage(post, id, (err) => {
        if (err) throw err

        return res.status(200).json({
            message : "Done successfully",
            status : 200
        })
    }, () => {
        return res.status(405).json({
            message : "invalide driver",
            status : 401
        })
    }, () => {
        return res.status(403).json({
            message : "image is required",
            status : 403
        })
    })
}

// start trip
exports.postStartTrip = (req, res) => {
    var id = req.userData.userId,
        post = req.body,
        lang = req.params.lang,
        translation = eval(lang)

    if (post.latitude && post.longitude) {
        Drivers.findById(id)
        .select('name phone lineId associationId profileImage')
        .populate([{path : "lineId", select : "_id points users", populate : {path : "users", select : "_id location phone fcmToken"}}, {path : "busId", select : "plateNumber rightPlateNumber leftPlateNumber"}])
        .exec(async (err, driver) => {
            if (err) throw err
    // console.log(driver)
            if (driver) {
                let latitude = Number(post.latitude),
                    longitude = Number(post.longitude),
                    address = await geocoder.reverse({lat:latitude, lon:longitude}),
                    users = []

                    
                if (driver.lineId.users.length > 0) {
                    for (var n = 0; n < driver.lineId.users.length; n ++) {
                        users.push(driver.lineId.users[n]._id)
                    }
                }
                let trip = new Trips({
                    driver : {
                        name : driver.name,
                        id : driver
                    },
                    lineId : driver.lineId._id,
                    associationId : driver.associationId,
                    start : {
                        location : {
                            latitude,
                            longitude
                        },
                        address : address[0].formattedAddress,
                        time : new Date().getTime()
                    },
                    location : {
                        latitude,
                        longitude 
                    },
                    users,
                    tripRoute : [{
                        latitude,
                        longitude
                    }],
                    status : 1
                })

                trip.save((err, saved) => {
                    if (err) throw err
                    req.session.usersLine = []
                    req.session.tripLocation = {latitude : saved.location.latitude, longitude : saved.location.longitude}
                    for (var i = 0; i < driver.lineId.users.length; i ++) {
                        if (driver.lineId.users[i].location.latitude && driver.lineId.users[i].fcmToken) {
                            req.session.usersLine.push(
                                {
                                latitude : driver.lineId.users[i].location.latitude,
                                 longitude : driver.lineId.users[i].location.longitude,
                                  id : driver.lineId.users[i]._id,
                                  fcmToken : driver.lineId.users[i].fcmToken
                                })
                                var plateNumberType = "recent"

                                if (driver.busId.plateNumber) {
                                    plateNumberType = "old"
                                }

                                if (driver.profileImage.format) {
                                    var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/" + driver.profileImage.imageId + "." + driver.profileImage.format
                                }else {
                                    var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/v1584784906/klskq5yjvclxbujz7gxx.png"
                                }

                            var message = { 
                                to: driver.lineId.users[i].fcmToken,         
                                notification: {
                                    title: translation.tripStatus, 
                                    body: translation.tripStarted ,
                                    sound: "default"
                                },
                                
                                data: { 
                                    notificationNumber : 300,
                                    tripId : saved._id,
                                    driverName : driver.username,
                                    driverPhoneNumber : driver.phone.value,
                                    plateNumberType,
                                    plateNumber : driver.busId.plateNumber,
                                    rightPlateNumber : driver.busId.rightPlateNumber,
                                    leftPlateNumber : driver.busId.leftPlateNumber,
                                    image,
                                    latitude : saved.start.location.latitude,
                                    longitude : saved.start.location.longitude,
                                    address : saved.start.address,
                                    title: translation.tripStatus, 
                                    body: translation.tripStarted
                                }
                            }
            
                            fcm.send(message, function(err, response){
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("Successfully sent with response: ", response);
                                }
                            })
                        }
                    }
                    
                    var notifyNearby = setInterval(() => {
                        // console.log(req.session.usersLine)
                        if (req.session.usersLine.length > 0) {
                            for (var i = 0; i < req.session.usersLine.length; i ++) {
                                var distance = geolib.getPreciseDistance(req.session.tripLocation, {latitude : req.session.usersLine[i].latitude, longitude : req.session.usersLine[i].longitude})
                                if (distance < 50) {
                                    var message = { 
                                        to: req.session.usersLine[i].fcmToken,         
                                        notification: {
                                            title: translation.tripStatus, 
                                            body: translation.approachedYou ,
                                            sound: "default"
                                        },
                                        
                                        data: { 
                                            notificationNumber : 310,
                                            distance,
                                            title: translation.tripStatus, 
                                            body: translation.approachedYou
                                        }
                                    }
                    
                                    fcm.send(message, function(err, response){
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log("Successfully sent with response: ", response);
                                        }
                                    })
                                    var index = req.session.usersLine.indexOf(i)
                                    req.session.usersLine.splice(index, 1)
                                    // console.log(req.session.usersLine)
                                }
                            }
                        }else {
                            console.log("done")
                            clearInterval(notifyNearby)
                        }
                    }, 10000);

                    return res.status(200).json({
                        message : "Done successfully",
                        status : 200,
                        tripId : saved._id
                    })
                })
            }
        })
    }else {
        return res.status(403).json({
            message : "latitude & longitude are required",
            status : 403
        })
    }
    
}

// get today trip
exports.getTodayTrip = (req, res) => {
    var id = req.userData.userId
    Drivers.findById(id).populate([{path : "lineId", select : "name tripTime _id"}, {path : "busId", select : "plateNumber rightPlateNumber leftPlateNumber"}]).exec(async (err, driver) => {
        if (err) throw err

        if (driver) {
            var currentTime = new Date().getTime(),
                tripTime = new Date(new Date().toDateString() + " " + driver.lineId.tripTime).getTime(),
                trip = await Trips.findOne({lineId : driver.lineId._id, status : 1}).select("_id")

                var plateNumberType = "recent"
                if (driver.busId.plateNumber) {
                    plateNumberType = "old"
                }
                var tripId = ""
                if (trip) {
                    tripId = trip._id
                }

                if (driver.profileImage.format) {
                    var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/" + driver.profileImage.imageId + "." + driver.profileImage.format
                }else {
                    var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/v1584784906/klskq5yjvclxbujz7gxx.png"
                }
                var data = {
                    username : driver.username,
                    lineName : driver.lineId.name,
                    tripTime : driver.lineId.tripTime,
                    tripId : tripId,
                    plateNumberType,
                    plateNumber : driver.busId.plateNumber,
                    rightPlateNumber : driver.busId.rightPlateNumber,
                    leftPlateNumber : driver.busId.leftPlateNumber,
                    driverProfileImage : image
                }
                return res.status(200).json({
                    data,
                    message : "Done successfully",
                    status : 200
                })
            

        }else {
            return res.status(405).json({
                message : "invalide driver",
                status : 401
            })
        }
    })
}

// get passengers
exports.getPassengers = (req, res) => {
    var id = req.params.id

    Trips.findById(id).select("users").populate({path : "users", select : "username profileImage location phone _id"}).exec((err, trip) => {
        if (err) throw err

        if (trip) {
            var data = trip.users.map(function (p) {
                if (p.profileImage.format) {
                    var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/" + p.profileImage.imageId + "." + p.profileImage.format
                }else {
                    var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/v1584784906/klskq5yjvclxbujz7gxx.png"
                }
                var address = "",
                    latitude = "",
                    longitude = ""
                if (p.location.address) {
                    console.log("pppssssss")
                    address = p.location.address
                    latitude = JSON.stringify(p.location.latitude)
                    longitude = JSON.stringify(p.location.longitude)
                }
                passengers = {
                    username : p.username,
                    phoneNumber : p.phone.value,
                    image,
                    latitude : latitude,
                    longitude : longitude,
                    address : address,
                    userId : p._id
                }

                return passengers
            })

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
}

// schedule notification
exports.scheduleNotifications = (req, res) => {
    var id = req.userData.userId,
        lang = req.params.lang,
        translation = eval(lang)
    Drivers.findById(id).populate([{path : "lineId", select : "name tripTime"}, {path : "busId", select : "plateNumber rightPlateNumber leftPlateNumber"}]).exec((err, driver) => {
        if (err) throw err

        if (driver) {
            var currentTime = new Date().getTime(),
            tripTime = new Date(new Date().toDateString() + " " + driver.lineId.tripTime).getTime()
            tripTime = new Date(tripTime - 600000).toTimeString()
                arr = tripTime.split(':')
                hour = parseInt(arr[0]);
                min = parseInt(arr[1]);

            var rule = new schedule.RecurrenceRule();
            rule.dayOfWeek = [0, new schedule.Range(0, 6)];
            rule.hour = hour;
            rule.minute = min;
            
            var j = schedule.scheduleJob(rule, function(){
                var plateNumberType = "recent"
                if (driver.busId.plateNumber) {
                    plateNumberType = "old"
                }

                if (driver.profileImage.format) {
                    var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/" + driver.profileImage.imageId + "." + driver.profileImage.format
                }else {
                    var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/v1584784906/klskq5yjvclxbujz7gxx.png"
                }
                
                var message = { 
                    to: driver.fcmToken,
                    notification: {
                        title: translation.tripStatus, 
                        body: translation.tripStartSoon ,
                        sound: "default"
                    },
                    
                    data: { 
                        notificationNumber : 300,
                        username : driver.username,
                        lineName : driver.lineId.name,
                        tripTime : driver.lineId.tripTime,
                        plateNumberType,
                        plateNumber : driver.busId.plateNumber,
                        rightPlateNumber : driver.busId.rightPlateNumber,
                        leftPlateNumber : driver.busId.leftPlateNumber,
                        driverProfileImage : image,
                        title: translation.tripStatus, 
                        body: translation.tripStartSoon
                    }
                }

                fcm.send(message, function(err, response){
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                })
            });

            return res.status(200).json({
                message : "Done successfully",
                status : 200
            })
        }
    })
}

// post add complaint
exports.postAddComplaint = (req, res) => {
    var id = req.userData.userId,
        post = req.body

    if (post.description && post.tripId) {
        
        Trips.findById(post.tripId).select("associationId driverId").exec((err, trip) => {
            if (err) throw err
            console.log(trip)
            post.associationId = trip.associationId
            post.driverId = id
            post.time = new Date().getTime()
            ComplaintDraivers.addNewComplaints(post, (err) => {
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

// post end trip
exports.postEndTrip = (req, res) => {
    var post = req.body,
        lang = req.params.lang,
        translation = eval(lang)

    if (post.tripId) {
        Trips.findById(post.tripId).populate([{path : "users", select : "fcmToken"}, {path : "lineId", select : "name"}, {path : "driver.id", select : "username"}]).exec((err, trip) => {
            if (err) throw err

            if (trip) {
                trip.reachTime = new Date().getTime()
                trip.status = 2
                trip.save(err => {
                    if (err) throw err
                    var tokens = []
                    for (var i = 0; i < trip.users.length; i ++) {
                        tokens.push(trip.users[i].fcmToken)
                    }

                    var message = { 
                        registration_ids: tokens,         
                        notification: {
                            title: translation.tripStatus, 
                            body: translation.reachedSuccessfully ,
                            sound: "default"
                        },
                        
                        data: { 
                            notificationNumber : '330',
                            tripId : trip._id,
                            driverName : trip.driver.id.username,
                            lineName : trip.lineId.name,
                            startLocationLatitude : JSON.stringify(trip.start.location.latitude),
                            startLocationLongitude : JSON.stringify(trip.start.location.longitude),
                            startAddress : trip.start.address,
                            startTime : trip.start.time,
                            destinationLocationLatitude : JSON.stringify(trip.location.latitude),
                            destinationLocationLongitude : JSON.stringify(trip.location.longitude),
                            destinationAddress : trip.location.address,
                            reachTime : trip.reachTime,
                            title: translation.tripStatus, 
                            body: translation.reachedSuccessfully
                        }
                    };


                    fcm.send(message, function(err, response){
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Successfully sent with response: ", response);
                        }
                    })
                })
                return res.status(200).json({
                    message : "Done successfully",
                    status : 200
                })
            }else {
                return res.status(412).json({
                    message : "Invalid trip",
                    status : 412
                })
            }
        })
    }else {
        return res.status(403).json({
            message : "tripId is required",
            status : 403
        })
    }
}
