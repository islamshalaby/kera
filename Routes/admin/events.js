var express = require('express'),
    router = express.Router(),
    associationAuth = require('../../middleware/associationAuth'),
    eventsController = require('../../Controller/admin/events')
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

    // get add event
    router.get('/new', eventsController.getAddEvent)

    // post add event
    router.post('/new', parser.any(), eventsController.postAddEvent)
    
    // get events
    router.get("/:page", eventsController.getEvents)

    // get edit event
    router.get('/edit/:eventId', eventsController.getEditEvent)

    // update event
    router.post('/edit/:eventId', parser.any(), eventsController.updateEvent)

    // update event
    router.get('/delete/:eventId', eventsController.deleteEvent)
    

    // delete image
    router.get('/delete/:imageId/:eventId', eventsController.getDeleteImage)
    
    

module.exports = router