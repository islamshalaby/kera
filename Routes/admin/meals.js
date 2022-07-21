var express = require('express')
var router = express.Router()
var mealsController = require('../../Controller/admin/meals')
var associationAuth = require('../../middleware/associationAuth')
const multer = require("multer")
const cloudinary = require("cloudinary")
const cloudinaryStorage = require("multer-storage-cloudinary")
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
const parser = multer({ storage: storage })

router.all('/*', associationAuth, (req, res, next) => {
    next()
})

// get add new
router.get('/new', mealsController.getAddEducation)

// post add new
router.post('/new', parser.any(), mealsController.postAddEducation)

// get edit
router.get('/edit/:mealId', mealsController.getEditMeal)

// update meal
router.post('/edit/:mealId', parser.any(), mealsController.updateMeal)

// delete meal
router.get('/delete/:mealId', mealsController.deleteMeal)


// delete image
router.get('/delete/:imageId/:mealId', mealsController.getDeleteImage)

// get add new
router.get('/:page', mealsController.getMeals)

// get meal comments
router.get('/:mealId/comments', mealsController.getMealComments)





module.exports = router