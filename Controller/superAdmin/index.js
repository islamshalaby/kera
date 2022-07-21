var Associations = require('../../Models/association'),
    jwt = require('jsonwebtoken')

// compare username & password
exports.postLogin = async (req, res) => {
    var superAdmin = await Associations.findOne({authType : 1, email : req.body.username})

    if (superAdmin) {
        Associations.comparePassword(req.body.password, superAdmin.password, (error, result) => {
            if (error) throw error
            if (result) {
                const token = jwt.sign({
                    email : superAdmin.email,
                    adminId : superAdmin._id
                },
                'secret',
                {}   
                )
                req.session.token = token
                const decoded = jwt.verify(token , 'secret')
                res.redirect('/super-admin')
            }else {
                req.flash('wrongLoginEn', 'Email or Password is incorrect')
                req.flash('wrongLoginAr', 'البريد الإلكترونى أو كلمة المرور غير صحيحة')
                res.redirect('/super-admin/login')
            }
        })
    }else {
        req.flash('wrongLoginEn', 'Invalid Email or Password')
        req.flash('wrongLoginAr', 'البريد الإلكترونى أو كلمة المرور غير صحيحة')
        res.redirect('/super-admin/login')
    }
}
// get login
exports.getLogin = (req, res) => {

    res.render('association/login')
}