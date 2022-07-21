var express = require('express')
var router = express.Router()
var driverController = require('../../Controller/admin/drivers')
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

// get add new driver
router.get("/new", driverController.getAddNewDriver)

// post add new driver
router.post("/new", parser.any(), driverController.postAddNewDriver)

// get drivers
router.get('/:page', driverController.getDrivers)

// get edit drivers
router.get('/edit/:id', driverController.getEdtiDriver)

// post edit drivers
router.post('/edit/:id', parser.any(), driverController.postEditDriver)

module.exports = router