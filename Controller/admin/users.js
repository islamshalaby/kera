var Users = require('../../Models/user'),
    Lines = require ("../../Models/line"),
    nodemailer = require("nodemailer"),
    config = require('config'),
    dbConfig = config.get('Customer')

// get add new user
exports.getAddNewUser = async (req, res) => {
    res.render('association/users_form', {
        type : "new",
        profile : req.profile
    })
}

// post add new user
exports.postAddNewUser = (req, res) => {
    var post = req.body,
        files = req.files,
        val = Math.floor(1000 + Math.random() * 9000)
        post.associationId = req.user._id
        post.code = val

    if (post.phone == "+201113778820" || post.phone == "+201018808084") {
        post.code = "1234"
    }else {
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
    

    Users.addNewUser(post, files, async (err, saved) => {
        if (err) throw err
    
        
        res.redirect('/association-panel/users/1')
    }, () => {
        req.flash('requiredError', "name && phone are required fields")
        res.redirect('back')
    }, () => {
        req.flash('requiredError', "Phone number is already exist")
        res.redirect('back')
    }, () => {
        req.flash('requiredError', "Email is already exist")
        res.redirect('back')
    })
}

// get users
exports.getUsers = async (req, res) => {
    var page = req.params.page
    // await Users.updateMany({}, {deleted : false})
    Users.getUsers({associationId : req.user._id, deleted : false}, page, (err, users) => {
        if (err) throw err

        res.render("association/users", {
            data : users.docs,
            pages : users.pages,
            currentPage : users.page,
            profile : req.profile
        })
    })
}

// get edit user
exports.getEditUser = async (req, res) => {
    var id = req.params.id,
        lines = await Lines.find().select("_id name")

    Users.findById(id).populate({path : "students", select : "username studentId profileImage classId", populate : {path : "classId", select : "name teachers", populate : {path : 'teachers', select : 'username'}}}).exec((err, user) => {
        if (err) throw err
        
        res.render('association/users_edit', {
            data : user,
            lines,
            type : 'edit',
            profile : req.profile
        })
    })
}

// post edit user
exports.postEditUser = async (req, res) => {
    var id = req.params.id,
        post = req.body,
        files = req.files
        post.associationId = req.user._id

    // console.log(post)
    Users.editUser(post, files, id, async (err, saved) => {
        if (err) throw err

        if (post.lineId) {
            var line = await Lines.findById(saved.lineId).select('users supervisorId points')
            
            if (line.users.includes(saved._id) == false) {
                line.users.push(saved)
            }

            
            if (post.latitude && post.longitude) {
                var usersLine = await Users.find({lineId : post.lineId}).select("location")
                for (var i = 0; i < usersLine.length; i ++) {
                    if (usersLine[i].location.latitude) {
                        line.points.push({
                            "latitude" : usersLine[i].location.latitude,
                            "longitude" : usersLine[i].location.longitude,
                            "address" : usersLine[i].location.address
                        })
                    }
                }
            }

            line.save(err => {
                if (err) throw err
            }) 
        }

        res.redirect('/association-panel/users/1')
    }, () => {
        req.flash('requiredError', "Phone number is already exist")
        res.redirect('back')
    }, () => {
        req.flash('requiredError', "Email is already exist")
        res.redirect('back')
    })
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

    res.redirect('back')
}

// delete user
exports.deleteUser = async (req, res) => {
    var id = req.params.id
    await Users.findByIdAndUpdate(id, {deleted : true})

    res.redirect('back')
}