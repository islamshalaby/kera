var medicalReports = require('../../Models/medicalReport'),
    Reports = require('../../Models/report'),
    moment = require('moment')

// get medical reports
exports.getMedicalReports = async (req, res) => {
    var page = req.params.page,
        options = {
            page:   page,
            populate : [{path : 'students', select : '_id profileImage'}, {path : 'teacher', select : '_id username specialization profileImage'}], 
            select : '_id students date status',
            limit:    50,
            sort: {
                _id : -1
            }
        },
        data = await medicalReports.paginate({associationId : req.user._id}, options)

    res.render('association/medical_reports', {
        data : data.docs,
        profile : req.profile,
        moment
    })
}

// get medical report details
exports.getMedicalReportDetails = async (req, res) => {
    var reportId = req.params.reportId,
        data = await medicalReports.findById(reportId).select('_id students teacher question1 question2 date status')
        .populate([{path : 'teacher', select : '_id profileImage username'}, {path : 'students', select : '_id profileImage'}])

    
    res.render('association/medical_report_details', {
        data,
        profile : req.profile,
        moment
    })
}

// get daily reports
exports.getDailyReports = async (req, res) => {
    var page = req.params.page,
        options = {
            page:   page,
            populate : [{path : 'students', select : '_id profileImage'}, {path : 'teacher', select : '_id username specialization profileImage'}], 
            select : '_id students date status',
            limit:    10,
            sort: {
                _id : -1
            }
        },
        data = await Reports.paginate({associationId : req.user._id}, options)

    res.render('association/daily_reports', {
        data : data.docs,
        pages : data.pages,
        currentPage : data.page,
        profile : req.profile,
        moment
    })
}

// get daily report details
exports.getDailyReportDetails = async (req, res) => {
    var reportId = req.params.reportId,
        data = await Reports.findById(reportId).select('_id students teacher replies answers date status')
        .populate([{path : 'teacher', select : '_id profileImage username'}, {path : 'students', select : '_id profileImage'}, {path : "replies.parent", select : "_id profileImage username"}])

    
    res.render('association/daily_report_details', {
        data,
        profile : req.profile,
        moment
    })
}