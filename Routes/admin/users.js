var express = require('express'),
    router = express.Router(),
    associationAuth = require('../../middleware/associationAuth'),
    usersController = require('../../Controller/admin/users'),
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

// get add new user
router.get('/new', usersController.getAddNewUser)

// post add new user
router.post('/new', parser.any(), usersController.postAddNewUser)

// get users
router.get('/:page', usersController.getUsers)

// get edit users
router.get('/edit/:id', usersController.getEditUser)

// post edit users
router.post('/edit/:id', parser.any(), usersController.postEditUser)

// delete user
router.get('/delete/:id', usersController.deleteUser)

// resend code
router.get('/resendcode/:userId', usersController.resendCode)

module.exports = router