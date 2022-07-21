var Associations = require("../../Models/association"),
    Types = require("../../Models/type"),
    Tags = require('../../Models/tag'),
    Setting = require('../../Models/setting')

// get super admin landing page
exports.getLandingPage = (req, res) => {
    res.render("landing")
}

// get add new association
exports.getAddNewAssociation = async (req, res) => {
    var types = await Types.find({deleted : false}),
        tags = await Tags.find({deleted : false})
    res.render("association_form", {
        type : "new",
        types,
        tags
    })
}

// post add new association
exports.postAddNewAssociation = (req, res) => {
    var post = req.body
    console.log(post)
    Associations.addAdmin(post, () => {
        res.redirect("back")
    }, () => {
        req.flash('requiredError', "Email & phone number & name & password are required fields")
        res.redirect('back')
    }, () => {
        req.flash('requiredError', "Phone number is already exist")
        res.redirect('back')
    }, () => {
        req.flash('requiredError', "Email is already exist")
        res.redirect('back')
    }, () => {
        req.flash('requiredError', "Name is already exist")
        res.redirect('back')
    }, req.files)
}

// get associations
exports.getAssociations = (req, res) => {
    Associations.find((err, data) => {
        if (err) throw err

        res.render("associations", {
            data
        })
    })
}

// get edit association
exports.getEditAssociation = async (req, res) => {
    var id = req.params.id,
        types = await Types.find({deleted : false}),
        tags = await Tags.find({deleted : false})
        
    Associations.findById(id).exec((err, data) => {
        if (err) throw err

        res.render('association_form', {
            data,
            type : "edit",
            types,
            tags
        })
    })
}

// post edit association
exports.postEditAssociation = (req, res) => {
    var id = req.params.id,
        body = req.body,
        files = req.files

        
    Associations.editAdmin(id, body, files, () => {
        res.redirect('back')
    })
}

// get settings
exports.getSettings = async (req, res) => {
    var data = await Setting.findOne({contactType : 1})

    res.render("settings_app", {
        data,
        profile : req.profile
    })
}

// post settings
exports.postSettings = async (req, res) => {
    var post = req.body,
        setting = await Setting.findOne({contactType : 1})

    if (setting) {
        setting.about_en = post.about_en
        setting.about_ar = post.about_ar
        setting.terms_en = post.terms_en
        setting.terms_ar = post.terms_ar
        setting.privacy_en = post.privacy_en
        setting.privacy_ar = post.privacy_ar
        setting.save()
    }else {
        post.contactType = 1
        Setting(post).save()
    }
    

    res.redirect('back')
}