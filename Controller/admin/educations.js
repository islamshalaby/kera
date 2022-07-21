var Educations = require('../../Models/education'),
    Classes = require('../../Models/class'),
    moment = require('moment'),
    mongoose = require('mongoose')

// get add education
exports.getAddEducation = async (req, res) => {
    var classes = await Classes.find({associationId : req.user._id}).select('name')

    res.render("association/education_form", {
        classes,
        type : "new",
        profile : req.profile
    })
}

// post add education
exports.postAddEducation = (req, res) => {
    var post = req.body,
        files = req.files,
        images = []
    if (files && files.length > 0) {
        for (var i =0; i < files.length; i ++) {
            var singleImage = ""
            if (files[i].fieldname == 'images') {
                singleImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                images.push(singleImage)
            }
        }
    }
    post.edDate = new Date(post.edDate).getTime()
    post.associationId = req.user._id
    post.images = images
    if (post.class.length > 0) {
        var cls = post.class.map(function (cl) {
            post.class = mongoose.Types.ObjectId(cl)
            Educations(post).save()
        })
    }

    res.redirect('back')
}

// get educations
exports.getEducations = async (req, res) => {
    var page = req.params.page,
        options = {
            page:   page,
            populate : [{path : 'class', select : '_id name'}], 
            select : '_id class edDate title_en title_ar images',
            limit:    50,
            sort: {
                _id : -1
            }
        },
        data = await Educations.paginate({associationId : req.user._id}, options)

    res.render("association/educations", {
        data : data.docs,
        profile : req.profile,
        moment
    })
}

// get edit education
exports.getEditEducation = async (req, res) => {
    var id = req.params.id,
        data = await Educations.findById(id),
        classes = await Classes.find({associationId : req.user._id}).select('name')

    res.render("association/education_form", {
        type : 'edit',
        data,
        profile : req.profile,
        moment,
        classes
    })
}

// update education
exports.updateEducation = async (req, res) => {
    var id = req.params.id,
        post = req.body,
        files = req.files,
        images = [],
        education = await Educations.findById(id)

    education.title_en = post.title_en
    education.title_ar = post.title_ar
    education.description_en = post.description_en
    education.description_ar = post.description_ar
    education.short_description_en = post.short_description_en
    education.short_description_ar = post.short_description_ar
    education.class = post.class
    education.edDate = new Date(post.edDate).getTime()
    if (files && files.length > 0) {
        for (var i = 0; i < files.length; i ++) {
            education.images.push(`https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`)
        }
    }

    education.save(err => {
        if (err) throw err

        res.redirect("back")
    })

}

// get delete image
exports.getDeleteImage = async (req, res) => {
    var imageId = req.params.imageId,
        educationId = req.params.educationId,
        ed = await Educations.findById(educationId)
        education = await Educations.findOneAndUpdate({_id : educationId}, {$pull : { images: ed.images[imageId] }})

    res.redirect('back')
}

