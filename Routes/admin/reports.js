var express = require('express'),
    router = express.Router(),
    associationAuth = require('../../middleware/associationAuth'),
    reportsController = require('../../Controller/admin/reports')

    router.all('/*', associationAuth, (req, res, next) => {
        next()
    })

// get medical reports
router.get('/medical/:page', reportsController.getMedicalReports)

// get medical report details
router.get('/medical/details/:reportId', reportsController.getMedicalReportDetails)

// get daily reports
router.get('/daily/:page', reportsController.getDailyReports)

// get daily report details
router.get('/daily/details/:reportId', reportsController.getDailyReportDetails)

module.exports = router