var express = require('express'),
    router = express.Router(),
    associationAuth = require('../../middleware/associationAuth'),
    settingsController = require('../../Controller/admin/settings')

    router.all('/*', associationAuth, (req, res, next) => {
        next()
    })

    // get settings
    router.get("/", settingsController.getSettings)

    // get arrival
    router.get("/arrival", settingsController.getArrivalQrCode)

    // get departure
    router.get("/departure", settingsController.getDepartureQrCode)

    // get settings
    router.post("/", settingsController.postSettings)

    
    // get attendances
    router.get("/attendances", settingsController.getDepartureAttendence)

    // get latest news
    router.get("/latest-news/:page", settingsController.getLatestNews)

    // post add latest news
    router.post("/latest-news/:page", settingsController.postAddLatestNews)

    // get contacts
    router.get("/contacts/:page", settingsController.getContactUs)

    // get applications
    router.get("/applications/:page", settingsController.getApplications)

    // get application details
    router.get("/applications/details/:id", settingsController.getApplicationDetails)

    // update latest news
    router.post("/latest-news/update/:id", settingsController.postUpdateLatestNews)

    
    


module.exports = router