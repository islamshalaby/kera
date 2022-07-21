var express = require("express"),
    router = express.Router(),
    userController = require('../../Controller/api/user'),
    userAuth = require('../../middleware/userAuth')


// post login
router.post('/login', userController.postLogIn)

// post check phone verified
router.post('/verifiedphone', userAuth, userController.postCheckPhoneVerified)

// get profile
router.get('/profile', userAuth, userController.getProfile)

// post update location
router.post('/updatelocation', userAuth, userController.postUpdateLocation)

// post update profile
router.post('/profile/update', userAuth, userController.postUpdateProfile)

// post update profile image
router.post('/profile/update/image', userAuth, userController.postProfileImage)

// get available trips
router.get('/trips/:condition', userAuth, userController.getAvailableTrips)

// get current trip
router.get('/current/trip', userAuth, userController.getCurrentTrip)

// post user complaint
router.post('/add/complaint', userAuth, userController.postAddComplaint)

// get user complaints
router.get('/complaints', userAuth, userController.getUserComplaints)

// post create post
router.post('/create/post', userAuth, userController.postCreatePost)

// get user portal
router.get('/portal', userAuth, userController.getUserPortal)

// get user students
router.get('/students', userAuth, userController.getUserStudents)

// get user students
router.get('/notifications/:page', userAuth, userController.getNotifications)

// get daily reports
router.get('/dailyreports/:studentId/:page', userAuth, userController.getDailyReports)

// get medical reports
router.get('/medicalreports/:studentId/:page', userAuth, userController.getMedicalReports)

// put report reply
router.put('/report-reply', userAuth, userController.postReply)



module.exports = router
