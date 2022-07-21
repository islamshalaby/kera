var Drivers = require("../../Models/driver"),
    Lines = require ("../../Models/line"),
    Buses = require("../../Models/bus"),
    Parents = require("../../Models/user"),
    Teachers = require("../../Models/teacher"),
    key = 'AIzaSyCMSfq40Bo2KuQvQVSQE1gmmgJdxEbDS0Y',
    NodeGeocoder = require('node-geocoder'),
    options = {
        provider: 'google',
        // Optional depending on the providers
        apiKey: key, // for Mapquest, OpenCage, Google Premier
        formatter: null         // 'gpx', 'string', ...
    },
    geocoder = NodeGeocoder(options)
    multer = require("multer"),
    cloudinary = require("cloudinary"),
    cloudinaryStorage = require("multer-storage-cloudinary"),
    
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


// get add new driver
exports.getAddNewDriver = async (req, res) => {
    var lines = await Lines.find({driverId : null}).select("_id name"),
        buses = await Buses.find({driverId : null, deleted : false}).select('plateNumber rightPlateNumber leftPlateNumber')
    res.render("association/drivers_form", {
        lines,
        buses,
        type : "new",
        profile : req.profile
    })
}

// post add new driver
exports.postAddNewDriver = async(req, res) => {
    var files = req.files,
        post = req.body
    post.associationId = req.user._id

    if (post.username && post.phone && post.lineId && post.associationId && post.busId) {
        var samePhone = await Drivers.findOne({"phone.value" : post.phone}).select("phone"),
            sameEmail = {},
            samePhoneParent = await Parents.findOne({"phone.value" : post.phone}).select("phone"),
            samePhoneTeacher = await Teachers.findOne({"phone.value" : post.phone}).select("phone")

        if (post.email) {
            sameEmail = await Drivers.findOne({email : post.email}).select("email")
        }

        if (samePhone || samePhoneParent || samePhoneTeacher) {
            req.flash('requiredError', "Phone number is already exist")
            res.redirect('back')
        }else if (sameEmail && sameEmail.email) {
            req.flash('requiredError', "Email is already exist")
            res.redirect('back')
        }else {
            var profileImage = {}
            if (files[0] && files[0].fieldname == 'profileImage') {
                profileImage = {
                    imageId : files[0].public_id,
                    format : files[0].format
                }
            }
            var driver = new Drivers ({
                username : post.username,
                phone : {
                    value : post.phone
                },
                email : post.email,
                lineId : post.lineId,
                associationId : post.associationId,
                profileImage : profileImage,
            })
            driver.save(async (err, saved) => {
                if (err) throw err
        
                var line = await Lines.findById(post.lineId).select("driverId"),
                    bus = await Buses.findById(post.busId).select("driverId")
        
                line.driverId = saved
                bus.driverId = saved
                bus.save(err => {
                    if (err) throw err
                })
                line.save(err => {
                    if (err) throw err
                })
        
                res.redirect("/association-panel/drivers/1")
            })
        }
    }else {
        req.flash('requiredError', "name && phone && line && association && plate number image are required fields")
        res.redirect('back')
    }
}

// get drivers
exports.getDrivers = (req, res) => {
    var page = req.params.page
    Drivers.getDrivers({associationId : req.user._id}, page, (err, drivers) => {
        if (err) throw err

        res.render("association/drivers", {
            data : drivers.docs,
            profile : req.profile
        })
    })
}

// get edit driver
exports.getEdtiDriver = (req, res) => {
    var id = req.params.id

    Drivers.findById(id, async (err, driver) => {
        if (err) throw err

        var lines = await Lines.find({$or : [{driverId : null}, {_id : driver.lineId}]}).select("_id name"),
            buses = await Buses.find({$or : [{driverId : null, deleted : false}, {_id : driver.busId}]}).select('plateNumber rightPlateNumber leftPlateNumber')

        res.render("association/drivers_form", {
            lines,
            buses,
            data : driver,
            type : "edit",
            profile : req.profile
        })
    })
}

// post edit driver
exports.postEditDriver = (req, res) => {
    var post = req.body,
        files = req.files,
        id = req.params.id

    Drivers.findById(id, async (err, driver) => {
        if (err) throw err
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
            req.flash('requiredError', "Phone number is already exist")
            res.redirect('back')
        }else if (sameEmail && sameEmail.email) {
            req.flash('requiredError', "Email is already exist")
            res.redirect('back')
        }else {
            var profileImage = {}

            if (driver.profileImage.imageId) {
                profileImage = {
                    imageId : driver.profileImage.imageId,
                    format : driver.profileImage.format
                }
            }

            if (files[0]) {
                if (driver.profileImage.imageId) {
                    cloudinary.v2.uploader.destroy(driver.profileImage.imageId, function(error, result){console.log(result, error)})
                }
                profileImage = {
                    imageId : files[0].public_id,
                    format : files[0].format
                }
            }
            
            driver.busId = post.busId
            driver.profileImage = profileImage
            driver.email = post.email
            driver.username = post.username
            driver.phone = {
                value : post.phone
            }
            driver.lineId = post.lineId
            driver.save(async (err, saved) => {
                if (err) throw err
        
                var line = await Lines.findById(saved.lineId).select("driverId"),
                    bus = await Buses.findById(saved.busId).select("driverId")
        
                line.driverId = saved
                bus.driverId = saved
        
                bus.save(err => {
                    if (err) throw err
                })
        
                line.save(err => {
                    if (err) throw err
                })
        
                res.redirect('/association-panel/drivers/1')
            })
        }
    })
}