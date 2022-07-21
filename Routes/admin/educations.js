var express = require('express')
var router = express.Router()
var educationController = require('../../Controller/admin/educations')
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
router.get('/new', educationController.getAddEducation)

// get edit education
router.get('/edit/:id', educationController.getEditEducation)

// post update education
router.post('/edit/:id', parser.any(), educationController.updateEducation)

// delete image
router.get('/delete/:imageId/:educationId', educationController.getDeleteImage)


// post add new
router.post('/new', parser.any(), educationController.postAddEducation)

// get educations
router.get('/:page', educationController.getEducations)


module.exports = router