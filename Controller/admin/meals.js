var Meals = require('../../Models/meal'),
    Classes = require('../../Models/class'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    async = require('async')
const { post } = require('../../Routes/admin')

// get add education
exports.getAddEducation = async (req, res) => {
    var classes = await Classes.find({associationId : req.user._id}).select('name')

    res.render("association/meal_form", {
        classes,
        type : "new",
        profile : req.profile
    })
}

// post add education
exports.postAddEducation = async (req, res) => {
    var post = req.body,
        files = req.files,
        images = [],
        dates = post.dates.split(',')
        
    if (post.class.length > 0) {
        if (files && files.length > 0) {
            for (var i =0; i < files.length; i ++) {
                var singleImage = ""
                if (files[i].fieldname == 'images') {
                    singleImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                    images.push(singleImage)
                }
                if (files[i].fieldname == 'mainImage') {
                    post.mainImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                }
                if (files[i].fieldname == 'tinyImage') {
                    post.tinyImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                }
            }
        }
        async.each (post.class, function (cl) {
            if (dates.length > 1) {
                dates.map(async function (dte) {
        
                    if (dte != '') {
                        post.class = mongoose.Types.ObjectId(cl)
                        post.associationId = req.user._id
                        post.images = images
                        post.mealDate = new Date(dte).getTime()
                        
                    
                        Meals(post).save((err) => {
                            if (err) throw err
                        })
                    }
                    
                })
                
            }
        })
        await res.redirect('back')
    }
    
    
}

// get meals
exports.getMeals = async (req, res) => {
    var page = req.params.page,
        options = {
            page:   page,
            populate : [{path : 'class', select : '_id name'}], 
            select : '_id class mealDate title_en title_ar mainImage tinyImage comments',
            limit:  10,
            sort: {
                mealDate : -1
            }
        },
        data = await Meals.paginate({associationId : req.user._id}, options)

        

    res.render("association/meals", {
        data : data.docs,
        pages : data.pages,
        currentPage : data.page,
        profile : req.profile,
        moment
    })
}

// get meal comments
exports.getMealComments = async (req, res) => {
    var mealId = req.params.mealId,
        data = await Meals.findById(mealId).select('_id title_en title_ar comments').populate([{path : 'comments.publisher', select : '_id profileImage username'}])

    res.render("association/meal_comments", {
        data,
        profile : req.profile,
        moment
    })
}

// get edit meal
exports.getEditMeal = async (req, res) => {
    var mealId = req.params.mealId,
        data = await Meals.findById(mealId),
        classes = await Classes.find({associationId : req.user._id}).select('name')
    

    res.render("association/meal_form", {
        classes,
        data,
        type : "edit",
        profile : req.profile,
        moment
    })
}

// update meal
exports.updateMeal = async (req, res) => {
    var mealId = req.params.mealId,
        meal = await Meals.findById(mealId),
        post = req.body
        
    var files = req.files,
        images = [],
        dates = post.dates.split(',')

    if (dates.length > 2) {
        dates.map(function (dte) {

            if (dte != '') {
                if (new Date(dte).getTime() != new Date(meal.mealDate).getTime()) {
                    if (files && files.length > 0) {
                        for (var i =0; i < files.length; i ++) {
                            var singleImage = ""
                            if (files[i].fieldname == 'images') {
                                singleImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                                images.push(singleImage)
                            }
                            if (files[i].fieldname == 'mainImage') {
                                post.mainImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                            }
                            if (files[i].fieldname == 'tinyImage') {
                                post.tinyImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                            }
                        }
                    }
                    else {
                        for (var i =0; i < meal.images.length; i ++) {
                            images.push(meal.images[i])
                        }
                        post.mainImage = meal.mainImage
                        post.tinyImage = meal.tinyImage
                    }
                    
                    post.mealDate = new Date(post.mealDate).getTime()
                    post.associationId = req.user._id
                    post.images = images
                    post.mealDate = new Date(dte).getTime()
                    
                
                    Meals(post).save((err) => {
                        if (err) throw err
                    })
                }
                
            }
            
        })
        
    }else {
        if (files && files.length > 0) {
            for (var i =0; i < files.length; i ++) {
                var singleImage = ""
                if (files[i].fieldname == 'images') {
                    singleImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                    meal.images.push(singleImage)
                }
                if (files[i].fieldname == 'mainImage') {
                    meal.mainImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                }
                if (files[i].fieldname == 'tinyImage') {
                    meal.tinyImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                }
            }
        }
        meal.mealDate = new Date(post.mealDate).getTime()
        meal.title_en = post.title_en
        meal.title_ar = post.title_ar
        meal.meal_name_en = post.meal_name_en
        meal.meal_name_ar = post.meal_name_ar
        meal.description_en = post.description_en
        meal.description_ar = post.description_ar
        meal.short_description_en = post.short_description_en
        meal.short_description_ar = post.short_description_ar
        meal.save()
    }

    res.redirect('back')
}

// get delete image
exports.getDeleteImage = async (req, res) => {
    var imageId = req.params.imageId,
        mealId = req.params.mealId,
        ed = await Meals.findById(mealId)
        meal = await Meals.findOneAndUpdate({_id : mealId}, {$pull : { images: ed.images[imageId] }})

    res.redirect('back')
}

// delete meal
exports.deleteMeal = async (req, res) => {
    var id = req.params.mealId,
        meal = await Meals.findByIdAndRemove(id)

    res.redirect('back')
}