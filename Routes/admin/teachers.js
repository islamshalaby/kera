var express = require('express'),
    router = express.Router(),
    associationAuth = require('../../middleware/associationAuth'),
    teachersController = require('../../Controller/admin/teachers'),
    multer = require("multer"),
    cloudinary = require("cloudinary"),
    cloudinaryStorage = require("multer-storage-cloudinary")
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

// get add new teacher
router.get("/new", teachersController.getAddNewTeacher)

// post add new teacher
router.post("/new", parser.any(), teachersController.postAddNewTeacher)

// get students
router.get("/:page", teachersController.getTeachers)

// get edit teacher
router.get("/edit/:id", teachersController.geteditTeacher)

// delete teacher
router.get("/delete/:id", teachersController.deleteTeacher)

// post edit teacher
router.post("/edit/:id", parser.any(), teachersController.postEditTeacher)

// resend code
router.get('/resendcode/:userId', teachersController.resendCode)


module.exports = router