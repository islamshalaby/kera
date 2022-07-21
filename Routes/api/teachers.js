var express = require("express"),
    router = express.Router(),
    teacherController = require('../../Controller/api/teacher'),
    userAuth = require('../../middleware/userAuth')


// get classes
router.get('/classes', userAuth, teacherController.getClasses)

// get students by class
router.get('/class/:classId/students', userAuth, teacherController.getStudentsByClass)

// get latest reports
router.get('/latest/reports/:page', userAuth, teacherController.getLatestReports)

// get latest medical reports
router.get('/latest/mediacl-report/:page', userAuth, teacherController.getLatestMedicalReports)

// post create report
router.post('/create/report', userAuth, teacherController.postCreateDailyReport)

// post create medical report
router.post('/create/mediacl-report', userAuth, teacherController.postMedicalReport)

// update report questions
router.put('/update/question/report', userAuth, teacherController.updateQuestionDailyReport)

// update report absent
router.put('/update/bsent/report', userAuth, teacherController.makeStudentAbsent)

// update medical report questions
router.put('/update/mediacl-report', userAuth, teacherController.updateMedicalReport)

// upload medical report image
router.put('/update/mediacl-report/image', userAuth, teacherController.uploadMedicalReportImage)

// get report data
router.get('/get/report/:reportId', userAuth, teacherController.getReportData)

// get medical report data
router.get('/get/mediacl-report/:reportId', userAuth, teacherController.getMedicalReportData)

// publish report data
router.put('/publish/report', userAuth, teacherController.publishReport)

// publish medical report data
router.put('/publish/medical-report', userAuth, teacherController.publishMedicalReport)

// post check phone verified
router.post('/verifiedphone', userAuth, teacherController.postCheckPhoneVerified)

// get profile
router.get('/questions', userAuth, teacherController.getPortalQuestions)

// get profile
router.get('/profile', userAuth, teacherController.getProfile)

// post update profile
router.post('/profile/update', userAuth, teacherController.postUpdateProfile)

// post create post
router.post('/create/post', userAuth, teacherController.postCreatePost)


module.exports = router