var Associations = require('../../Models/association'),
    en = require('../../locales/en.json'),
    ar = require('../../locales/ar.json'),
    moment = require('moment'),
    News = require('../../Models/news'),
    Users = require('../../Models/user'),
    Teachers = require('../../Models/teacher'),
    Students = require('../../Models/student'),
    Contacts = require('../../Models/contact'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy

// compare username & password
passport.use(new LocalStrategy({
    usernameField: 'username', 
    passwordField: 'password'
},
function (username, password, done) {
    Associations.getAdminByUsernameOrPhoneOrEmail(username, function (err, admin) {
        if (err) throw err
        if (!admin) {
            return done(null, false, {
                message: 'Unknown Admin'
            })
        }

        Associations.comparePassword(password, admin.password, function (err, isMatch) {
            if (err) throw err
            if (isMatch) {
                if (admin.blocked == true) {
                    return done(null, false, {
                        message: 'admin blocked'
                    })
                    
                }else if (admin.accepted == false) {
                    return done(null, false, {
                        message: 'admin has not accepted yet'
                    })
                }else {
                    return done(null, admin)
                }
                
            } else {
                return done(null, false, {
                    message: 'Invalid Password'
                })
            }
        })

    })
}
))

passport.serializeUser(function (admin, done) {
    done(null, admin.id);
    });
    
passport.deserializeUser(function (id, done) {
    Associations.findById(id, function (err, admin) {
    done(err, admin);
});
});

// get index
exports.getIndex = async (req, res) => {
    var lang = req.locale,
        translation = eval(lang),
        parentCount = await Users.countDocuments({associationId : req.user._id, deleted : false}),
        studentCount = await Students.countDocuments({associationId : req.user._id, deleted : false}),
        teacherCount = await Teachers.countDocuments({associationId : req.user._id, deleted : false}),
        contactCount = await Contacts.countDocuments({associationId : req.user._id})

    res.render('association/index', {
        lang,
        translation,
        notification : req.notifications,
        profile : req.profile,
        parentCount,
        studentCount,
        teacherCount,
        contactCount,
        moment
    })
}

// get login
exports.getLogin = (req, res) => {

    res.render('association/login')
}

// get edit admin profile
// exports.getEditAdminProfile = async (req, res) => {
//     var lang = req.locale,
//         translation = eval(lang),
//         data = await Associations.findById(req.user)

//     res.render('Associations_form', {
//         lang,
//         translation,
//         type : 'profile',
//         data,
//         profile : req.profile,
//         notification : req.notifications
//     })
// }

// // post edit admin profile
// exports.postEditAdminProfile = async (req, res) => {
//     var data = req.body,
//         files = req.files,
//         id = req.user
//     Associations.editAdmin(id, data, files, () => {
//         res.redirect('back')
//     })
// }
