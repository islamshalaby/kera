var express = require("express"),
    router = express.Router(),
    driverController = require('../../Controller/api/driver'),
    userAuth = require('../../middleware/userAuth')

// post check phone verified
router.post('/:lang/:v/verifiedphone', userAuth, driverController.postCheckPhoneVerified)

// get profile
router.get('/:lang/:v/profile', userAuth, driverController.getProfile)

// post update profile
router.post('/:lang/:v/profile/update', userAuth, driverController.postUpdateProfile)

// post update profile image
router.post('/:lang/:v/profile/update/image', userAuth, driverController.postProfileImage)

// post start trip
router.post('/:lang/:v/start/trip', userAuth, driverController.postStartTrip)

// get passengers
router.get('/:lang/:v/passengers/:id', userAuth, driverController.getPassengers)

// get today trip
router.get("/:lang/:v/today/trip", userAuth, driverController.getTodayTrip)

// get schedule notifications
router.get("/:lang/:v/schedule/notifications", userAuth, driverController.scheduleNotifications)

// post user complaint
router.post('/:lang/:v/add/complaint', userAuth, driverController.postAddComplaint)

// post end trip
router.post('/:lang/:v/end/trip', userAuth, driverController.postEndTrip)

module.exports = router
