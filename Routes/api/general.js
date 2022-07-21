var express = require("express"),
    router = express.Router(),
    generalController = require('../../Controller/api/general'),
    userAuth = require('../../middleware/userAuth')

// get tags
router.get('/:lang/:v/tags', userAuth, generalController.getTags)

// post contact
router.post('/contacts', userAuth, generalController.postContact)

// post application 1
router.post('/application/step-1', generalController.postApplicationStep1)

// post application 2
router.put('/application/step-2', generalController.postApplicationStep2)

// post application 3
router.put('/application/step-3', generalController.postApplicationStep3)

// post application 4
router.put('/application/step-4', generalController.postApplicationStep4)

// get check application step
router.get('/check-application-step', generalController.checkApplicationStep)

// get setting
router.get('/setting/:associationId/:selected', generalController.getSetting)

// get app setting
router.get('/settings/:type/:lang', generalController.getAppSetting)

// get privacy
router.get('/privacy/:id/:lang', generalController.getAssociationPrivacy)

// get arrival qrcode data
router.post('/qrcode', userAuth, generalController.getQrCode)

// get attendance dates
router.get('/attendance-dates', userAuth, generalController.getAttendanceDates)

// get attendance data
router.get('/attendance/:page', userAuth, generalController.getAttendanceData)

// get departure qrcode data
// router.get('/departure', userAuth, generalController.getDepartureQrCode)


module.exports = router