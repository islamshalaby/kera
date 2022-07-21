var express = require('express'),
    router = express.Router(),
    associationAuth = require('../../middleware/associationAuth'),
    studentsController = require('../../Controller/admin/students'),
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

// get add new student
router.get("/new", studentsController.getAddNewStudent)

router.get("/update-all", studentsController.updateAll)

// post add new student
router.post("/new", parser.any(), studentsController.postAddNewStudent)

// get students
router.get("/:page", studentsController.getStudent)

// delete
router.get("/delete/:id", studentsController.getDelete)

// get edit student
router.get("/edit/:id", studentsController.getEditStudent)

// post edit student
router.post("/edit/:id", parser.any(), studentsController.postEditStudent)


module.exports = router