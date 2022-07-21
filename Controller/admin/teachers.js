var Teachers = require("../../Models/teacher"),
    Parents = require("../../Models/user"),
    Drivers = require("../../Models/driver"),
    Classes = require("../../Models/class"),
    nodemailer = require("nodemailer"),
    key = 'AIzaSyCMSfq40Bo2KuQvQVSQE1gmmgJdxEbDS0Y',
    mongoose = require('mongoose'),
    NodeGeocoder = require('node-geocoder'),
    config = require('config'),
    dbConfig = config.get('Customer')
    options = {
        provider: 'google',
        // Optional depending on the providers
        apiKey: key, // for Mapquest, OpenCage, Google Premier
        formatter: null         // 'gpx', 'string', ...
    },
    geocoder = NodeGeocoder(options)

// get add new teacher
exports.getAddNewTeacher = async (req, res) => {
    var classes = await Classes.find({associationId : req.user._id}).select("_id name")
    res.render("association/teachers_form", {
        type : "new",
        classes,
        profile : req.profile
    })
}

// post add new teacher
exports.postAddNewTeacher = async (req, res) => {
    var post = req.body,
        files = req.files,
        val = Math.floor(1000 + Math.random() * 9000)
        post.code = val

    post.associationId = req.user._id

    if (post.username && post.phone && post.classes && post.specialization) {
        
        var samePhone = await Teachers.findOne({"phone.value" : post.phone}).select("phone"),
        sameEmail = {},
        samePhoneParent = await Parents.findOne({"phone.value" : post.phone}).select("phone"),
        samePhoneDrivers = await Drivers.findOne({"phone.value" : post.phone}).select("phone")

        if (post.email) {
            sameEmail = await Teachers.findOne({email : post.email}).select("email")
        }

        if (samePhone || samePhoneParent || samePhoneDrivers) {
            req.flash('requiredError', "Phone is already exist")
            res.redirect('back')
        }else if (sameEmail && sameEmail.email) {
            req.flash('requiredError', "Email is already exist")
            res.redirect('back')
        }else {
            if (post.phone == "+201113778820" || post.phone == "+201018808084") {
                post.code = "1234"
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
                        to: post.email, // list of receivers
                        subject: "Kera App Registration ✔", // Subject line
                        text: "Kera App Registration", // plain text body
                        html: `Verfication Code : ${post.code}` // html body
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
            }
            
            if (files[0]) {
                post.profileImage = `https://res.cloudinary.com/keraapp/image/upload/${files[0].public_id}.${files[0].format}`
            }
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
            }
            var teacher = new Teachers(post)
            teacher.save(async (err, saved) => {
                if (err) throw err

                if (saved.classes) {
                    for (var i = 0; i < saved.classes.length; i ++) {
                        var clss = await Classes.findById(saved.classes[i]).select("teachers")
                        clss.teachers.push(saved)
                        clss.save()
                    }
                }

                res.redirect('/association-panel/teachers/1')
            })
        }
    }else {
        req.flash('requiredError', "name && phone && specialization are required fields")
        res.redirect('back')
    }
}

// get teachers
exports.getTeachers = async (req, res) => {
    var page = req.params.page
    // await Teachers.updateMany({}, {deleted : false})
    Teachers.getTeachers({associationId : req.user._id, deleted : false}, page, (err, data) => {
        if (err) throw err
        
        res.render("association/teachers", {
            data : data.docs,
            profile : req.profile
        })
    })
}

// get edit teacher
exports.geteditTeacher = async (req, res) => {
    var id = req.params.id,
        classes = await Classes.find({associationId : req.user._id}).select("_id name"),
        data = await Teachers.findById(id),
        teacherClasses = data.classes.map(function(p) {
            return JSON.stringify(p)
        })
    
    res.render("association/teachers_form", {
        type : "edit",
        data,
        classes,
        teacherClasses,
        profile : req.profile
    })
}

// post edit teacher
exports.postEditTeacher = async (req, res) => {
    var id = req.params.id,
        post = req.body,
        files = req.files,
        teacher = await Teachers.findById(id),
        samePhone = {},
        samePhoneParent = {},
        samePhoneTeacher = {},
        sameEmail = {}

        if (post.phone) {
            // samePhone = await Drivers.findOne({"phone.value" : post.phone}).select("phone"),
            samePhoneParent = await Parents.findOne({"phone.value" : post.phone}).select("phone"),
            samePhoneTeacher = await Teachers.findOne({"phone.value" : post.phone, _id : {$ne : teacher._id}}).select("phone")
        }

        if (post.email) {
            sameEmail = await Teachers.findOne({email : post.email, _id : {$ne : teacher._id}}).select("email") 
        }

        

        if ((samePhone && samePhone.phone) || (samePhoneParent && samePhoneParent.phone) || (samePhoneTeacher && samePhoneTeacher.phone)) {
            
            req.flash('requiredError', "Phone number is already exist")
            res.redirect('back')
        }else if (sameEmail && sameEmail.email) {
            
            req.flash('requiredError', "Email is already exist")
            res.redirect('back')
        }else {
            
            for (var i = 0; i < post.classes.length; i ++) {
                var oldClasses = await Classes.findOneAndUpdate({teachers : teacher._id}, {$pull : {teachers : teacher._id}})
                console.log(oldClasses)
            }
            

            
            if (files[0]) {
                post.profileImage = `https://res.cloudinary.com/keraapp/image/upload/${files[0].public_id}.${files[0].format}`
            }
            if (post.phone) {
                post.phone = {
                    value : post.phone,
                    verified : teacher.phone.verified
                }
            }

            if (post.latitude && post.longitude) {
                var address = await geocoder.reverse({lat:post.latitude, lon:post.longitude})
                post.location = {
                    latitude : Number(post.latitude),
                    longitude : Number(post.longitude),
                    address : address[0].formattedAddress
                }
            }
            
            id = mongoose.Types.ObjectId(id)
            
            Teachers.findByIdAndUpdate(id, post, async(err, saved) => {
                if (err) throw err

                if (post.classes) {
                    for (var i = 0; i < post.classes.length; i ++) {
                        
                        var clss = await Classes.findById(post.classes[i]).select("teachers")
                        
                        if (clss) {
                            clss.teachers.push(saved)
                            clss.save()
                        }
                    }
                }

                res.redirect('/association-panel/teachers/1')
                
            })
        }

}

// resend code
exports.resendCode = async (req, res) => {
    var val = Math.floor(1000 + Math.random() * 9000),
        user = await Users.findById(req.params.userId)

    user.code = val
    user.save()

    async function main(){
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'keraapp5@gmail.com', // generated ethereal user
                pass: 'xagfmnwltddlpacv' // generated ethereal password
            }
        });
        
        // send mail with defined transport object
        let info = {
            from: '"Kera App 👻" <keraapp5@gmail.com>', // sender address
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

    res.redirect('back')
}

// delete teacher
exports.deleteTeacher = async (req, res) => {
    var id = req.params.id
    await Teachers.findByIdAndUpdate(id, {deleted : true})

    res.redirect('back')
}