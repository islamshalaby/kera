const e = require('express');
const application = require('../../Models/application');
var Setting = require('../../Models/setting'),
    News = require('../../Models/news'),
    Contacts = require('../../Models/contact'),
    QRCode = require('qrcode'),
    cc = require('coupon-code'),
    moment = require('moment'),
    Attendes = require('../../Models/attend'),
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
// get settings
exports.getSettings = async (req, res) => {
    var data = await Setting.findOne({associationId : req.user._id})

    res.render("association/settings", {
        data,
        profile : req.profile
    })
}

// post settings
exports.postSettings = async (req, res) => {
    var post = req.body,
        setting = await Setting.findOne({associationId : req.user._id})

        
    if (setting) {
        setting.terms_en = post.terms_en
        setting.terms_ar = post.terms_ar
        setting.privacy_en = post.privacy_en
        setting.privacy_ar = post.privacy_ar
        setting.save()
    }else {
        post.associationId = req.user._id
        Setting(post).save()
    }
    

    res.redirect('back')
}

// get arrival qr code
exports.getArrivalQrCode = (req, res) => {

    Setting.findOne({associationId : req.user._id}, (err, data) => {
        if (err) throw err
        var arraivalCode = cc.generate({ parts : 1, partLen : 8 })

        data.arrivalQr = arraivalCode
        
        data.save(err => {
            if (err) throw err

            QRCode.toDataURL(data.arrivalQr, function (err, arrival) {
                var arrivalQr = ""
                cloudinary.v2.uploader.upload(arrival, async (err , result1)=>{
                    arrivalQr = `https://res.cloudinary.com/keraapp/image/upload/${result1.public_id}.${result1.format}`
                    res.render("association/qrcode", {
                        arrivalQr,
                        departureQr : ""
                    })
                })
                
            })

        })
    })
    
}

// get departure qr code
exports.getDepartureQrCode = (req, res) => {

    Setting.findOne({associationId : req.user._id}, (err, data) => {
        if (err) throw err
        var departureCode = cc.generate({ parts : 1, partLen : 8 })

        data.departureQr = departureCode
        data.save(err => {
            if (err) throw err

            QRCode.toDataURL(data.departureQr, function (err, departure) {
                cloudinary.v2.uploader.upload(departure, async (err , result2)=>{
                    var departureQr = `https://res.cloudinary.com/keraapp/image/upload/${result2.public_id}.${result2.format}`
                    res.render("association/qrcode", {
                        departureQr,
                        arrivalQr : ""
                    })
                })
            })

        })
    })
    
}

// get departure attendence
exports.getDepartureAttendence = async (req, res) => {
    var page = req.params.page,
        options = {
            page:   page,
            populate : [{path : 'teacher', select : '_id username profileImage specialization'}], 
            limit:    50,
            sort: {
                _id : -1
            }
        },
        data = await Attendes.paginate({associationId : req.user._id}, options)

    res.render("association/attendances", {
        data : data.docs,
        profile : req.profile,
        moment
    })
}

// get latest news
exports.getLatestNews = async (req, res) => {
    var lang = req.locale,
        translation = eval(lang),
        page = req.params.page,
        options = {
            page:   page,
            populate : [{path: 'associationId', select : 'image username'}], 
            select : 'associationId date description_en description_ar',
            limit:    50,
            sort: {
                _id : -1
            }
        },
        data = await News.paginate({associationId : req.user._id}, options)

    res.render('association/latest_news', {
        lang,
        translation,
        notification : req.notifications,
        profile : req.profile,
        data : data.docs,
        moment
    })
}

// post add latest news
exports.postAddLatestNews = (req, res) => {
    var post = req.body
        post.associationId = req.user._id

    News(post).save()

    res.redirect('back')
}

// update latest news
exports.postUpdateLatestNews = async (req, res) => {
    var id = req.params.id,
        post = req.body,
        news = await News.findByIdAndUpdate(id, {$set : post})

    res.redirect('back')
}

// get contact us
exports.getContactUs = async (req, res) => {
    var page = req.params.page,
        options = {
            page:   page,
            limit:    50,
            populate : {path : 'parent', select : '_id username profileImage'},
            sort: {
                _id : -1
            }
        },
        data = await Contacts.paginate({contactType : 2, associationId : req.user._id}, options)

    res.render("association/contacts", {
        data : data.docs,
        profile : req.profile,
        moment
    })
}

// get applications
exports.getApplications = async (req, res) => {
    var page = req.params.page,
        options = {
            page:   page,
            limit:    50,
            select : 'student location date',
            sort: {
                _id : -1
            }
        },
        data = await application.paginate({step : 4}, options)

    res.render("association/applications", {
        data : data.docs,
        profile : req.profile,
        moment
    })
}

// get application details
exports.getApplicationDetails = async (req, res) => {
    var data = await application.findById(req.params.id)

    res.render("association/application_details", {
        data,
        profile : req.profile,
        moment
    })
}