var express = require('express')
var router = express.Router()
var questionController = require('../../Controller/admin/questions')
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

// get edit medical-questions
router.get('/medical', questionController.getMedicalQuestion)

// post update medical questions
router.post('/medical', questionController.updateMedicalQuestions)

// get add daily-questions
router.get('/daily', questionController.getAddDailyQuestion)

// post add daily-questions
router.post('/daily', parser.any(), questionController.postAddDailyQuestion)


module.exports = router