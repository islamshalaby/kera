var express = require('express')
var router = express.Router()
var associationController = require('../../Controller/superAdmin/association'),
    indexController = require('../../Controller/superAdmin/index'),
    superAdminAuth = require('../../middleware/superAdminAuth'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    tagController = require('../../Controller/superAdmin/tags'),
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



// get login
router.get('/login', indexController.getLogin)

// post login
router.post('/login', indexController.postLogin)

// get super admin landing page
router.get("/", superAdminAuth, associationController.getLandingPage)

// get add new association
router.get("/association/new", associationController.getAddNewAssociation)

// post add new association
router.post("/association/new", parser.any(), associationController.postAddNewAssociation)

// get associations
router.get("/associations", associationController.getAssociations)

// get tags
router.get("/tags", tagController.getTags)

// post tag
router.post("/tags", tagController.postAddNewTag)

// get settings
router.get("/settings", associationController.getSettings)

// post tag
router.post("/settings", associationController.postSettings)

// get edit association
router.get("/association/edit/:id", associationController.getEditAssociation)

// post edit association
router.post("/association/edit/:id", parser.any(), associationController.postEditAssociation)

module.exports = router