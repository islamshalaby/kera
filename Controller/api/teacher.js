const e = require("express");

var Teachers = require("../../Models/teacher"),
    Parents = require("../../Models/user"),
    Drivers = require("../../Models/driver"),
    Classes = require('../../Models/class'),
    Posts = require('../../Models/post'),
    Users = require('../../Models/user'),
    Absents = require('../../Models/absent'),
    Students = require('../../Models/student'),
    Report = require('../../Models/report'),
    MedicalReport = require('../../Models/medicalReport'),
    MedicalQuestion = require('../../Models/medicalQuestion'),
    Notifications = require('../../Models/notification'),
    en = require('../../lang/en'),
    ar = require('../../lang/ar'),
    Questions = require('../../Models/question'),
    multer = require("multer"),
    post = require('../../Models/post'),
    FCM = require('fcm-node'),
    serverKey = 'AAAAt2s7WE8:APA91bEWFQGzDhGphYFdTY2ld4QBsutpWqWLdohShHCRGk8pqqfgwmbpBS82ntBciwkiLIhwkJREvcgOLVX32irbgjxhgcukpXvwtr_LnVCzDs6EfwqvipV7PbnLBtaVEaoe8p6JhFR_',
    fcm = new FCM(serverKey),
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

// post check phone verfied
exports.postCheckPhoneVerified = (req, res) => {
    var post = req.body,
        id = req.userData.userId

    if (post.code && post.phone) {
        Teachers.findOne({"phone.value" : post.phone, code : post.code}).select("phone code").exec((err, user) => {
            if (err) throw err
    
            if (user) {
                user.phone.verified = true
                user.code = ""
                
                user.save((err) => {
                    if (err) throw err
    
                    return res.status(200).json({
                        message : "Done successfully",
                        status : 200
                    })
                })
            }else {
                return res.status(401).json({
                    message : "invalide user",
                    status : 401
                })
            }
            
        })
    }else {
        return res.status(403).json({
            message : "code & phone required",
            status : 405
        })
    }
    
}

// get profile
exports.getProfile = (req, res) => {
    var id = req.userData.userId
    Teachers.findById(id).populate([{path : "classes", select : "name"}, {path : "associationId", select : "_id image"}]).exec((err, teacher) => {
        if (err) throw err

        if (teacher) {

            if (teacher.profileImage) {
                var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/" + teacher.profileImage.imageId + "." + teacher.profileImage.format
            }else {
                var image = "https://res.cloudinary.com/df0b7ctlg/image/upload/v1584784906/klskq5yjvclxbujz7gxx.png"
            }
            var classes = teacher.classes.map(function (p) {
                return {
                    _id : p._id,
                    name : p.name
                }
            })
            data = {
                username : teacher.username,
                email : teacher.email,
                phoneVerified : teacher.phone.verified,
                phoneNumber : teacher.phone.value,
                profileImage : image,
                associationId : teacher.associationId._id,
                associationLogo : teacher.associationId.image,
                specialization : teacher.specialization,
                classes,
                location : teacher.location,
                type : "teacher"
            }
    
            return res.status(200).json({
                message : "Done successfully",
                status : 200,
                data
            })
        }else {
            return res.status(405).json({
                message : "invalide driver",
                status : 401
            })
        }

    })
}

// post update profile
exports.postUpdateProfile = (req, res) => {
    var id = req.userData.userId,
        post = req.body

        Teachers.findById(id, async(err, teacher) => {
            if (err) throw err
            
            if (teacher) {
                
                if (post.phone) {
                    var samePhone = await Parents.findOne({"phone.value" : post.phone}),
                    samePhoneDriver = await Drivers.findOne({"phone.value" : post.phone}).select("phone"),
                    samePhoneTeacher = await Teachers.findOne({"phone.value" : post.phone, _id : {$ne : teacher._id}}).select("phone")
                    
                    teacher.phone = {
                        value : post.phone,
                        verified : false
                    }
                }
                if (post.email) {
                    var sameEmail = await Teachers.findOne({email : post.email, _id : {$ne : teacher._id}})
                    teacher.email = post.email
                }
                if (samePhone || samePhoneDriver || samePhoneTeacher) {
                    return res.status(406).json({
                        message : "phone number is already exist",
                        status : 406
                    })
                }else if (sameEmail) {
                    return res.status(406).json({
                        message : "email is already exist",
                        status : 406
                    })
                }else {
                    if (post.username) {
                        user.username = post.username
                    }
                    teacher.save(err => {
                        if (err) throw err

                        return res.status(200).json({
                            message : "Done successfully",
                            status : 200
                        })
                    })
                }
                
            }else {
                return res.status(405).json({
                    message : "invalide teacher",
                    status : 401
                })
            }
            
    })
}

// create post
exports.postCreatePost = (req, res) => {
    var id = req.userData.userId,
        lang = req.params.lang,
        translation = eval(lang),
        post = req.body,
        postData = {}
        
    if (post.image && post.body && post.tagId) {
        cloudinary.v2.uploader.upload(post.image, async (err , result)=>{
            if (err) throw err

            var teacher = await Teachers.findById(req.userData.userId).select('associationId username'),
                usersTokens = await Users.distinct("fcmToken"),
                teachersTokens = await Teachers.find({_id: {$ne : req.userData.userId}}).distinct("fcmToken")

                
            postData = post
            postData.image = {
                imageId : result.public_id,
                format : result.format
            }
    
            postData.body = post.body
            postData.associationId = teacher.associationId
            postData.tagId = post.tagId
            postData.teacherId = id

            Posts(postData).save((err, saved) => {
                if (err) throw err

                var message = { 
                    registration_ids: usersTokens,         
                    notification: {
                        title: translation.newPost, 
                        body: teacher.username + " " + translation.publishedAPost ,
                        sound: "default"
                    },
                    
                    data: { 
                        notificationNumber : '340',
                        postId : saved._id,
                        postBody : saved.body
                    }
                };


                fcm.send(message, function(err, response){
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                })

                var message2 = { 
                    registration_ids: teachersTokens,         
                    notification: {
                        title: translation.newPost, 
                        body: teacher.username + " " + translation.publishedAPost ,
                        sound: "default"
                    },
                    
                    data: { 
                        notificationNumber : '340',
                        postId : saved._id,
                        postBody : saved.body
                    }
                };


                fcm.send(message2, function(err, response){
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                })

                return res.status(200).json({
                    message : "Done successfully",
                    status : 200
                })
            })
    
        })
    }else {
        return res.status(403).json({
            message : "image && body && tagId && userId are required",
            status : 403
        })
    }
}

// get classes
exports.getClasses = async (req, res) => {
    var data = {},
        teacherId = req.userData.userId,
        lang = req.headers.lang,
        teacher = await Teachers.findById(teacherId).select('associationId')
        if (!teacher) {
            return res.status(409).json({
                message : "no teacher",
                status : 409
            })
            
        }

        var classes = await Classes.find({associationId : teacher.associationId}).select('name'),
            all = "All"

        if (lang == 'ar') {
            all = "الكل"
        }
        data.classes = []
        data.classes.push({
            _id : "0",
            name : all
        })

        for (var i =0; i < classes.length; i ++) {
            data.classes.push(classes[i])
        }
        

    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })
}

// get students by class
exports.getStudentsByClass = async (req, res) => {
    var classId = req.params.classId,
        search = req.query.search,
        teacherId = req.userData.userId,
        teacher = await Teachers.findById(teacherId).select('associationId')
        if (!teacher) {
            return res.status(409).json({
                message : "no teacher",
                status : 409
            })
        }
        var query = {associationId : teacher.associationId, deleted : false}

        if (classId != 0) {
            query.classId = classId
        }
        

        if (search && search.length > 0) {
            query.username = { $regex: '.*' + search + '.*', $options: 'i' }
        }
        var data = await Students.find(query).select('username _id profileImage')
        
        if (req.headers.reportid) {
            
            var report = await Report.findById(req.headers.reportid).select('students'),
                medical = await MedicalReport.findById(req.headers.reportid).select('students'),
                students = []
                
            if (data && data.length > 0 && (report || medical)) {
                for (var i =0; i < data.length; i ++) {
                    if (report) {
                        if (!report.students.includes(data[i].id)) {
                            students.push(data[i])
                        }
                    }else {
                        if (!medical.students.includes(data[i].id)) {
                            students.push(data[i])
                        }
                    }
                    
                }

                data = students
            }
        }
    
    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })
    
}


// create daily report
exports.postCreateDailyReport = async (req, res) => {
    var post = req.body,
        teacherId = req.userData.userId,
        teacher = await Teachers.findById(teacherId).select('associationId')

    if (post.students) {
        post.teacher = teacherId
        post.associationId = teacher.associationId
        post.date = Date.now()
        
        Report(post).save(async (err, saved) => {
            if (err) {
                return res.status(409).json({
                    message : "no reports",
                    status : 409
                })
            }

            var report = await Report.findById(saved._id).select('_id teacherComments students date').populate([{path : "students", select : "profileImage username"}]),
                data = {
                    _id : report._id,
                    selectedStudents : report.students,
                    teacherComments : report.teacherComments,
                    date : report.date
                }

            return res.status(200).json({
                message : "Done successfully",
                status : 200,
                data
            })
        })
    }else {
        return res.status(403).json({
            message : "students is required",
            status : 403
        })
    }
}

// get latest reports
exports.getLatestReports = async (req, res) => {
    var teacherId = req.userData.userId,
        teacher = await Teachers.findById(teacherId).select("profileImage associationId"),
        page = req.params.page,
        options = {
            select : 'date status answers sent',
            populate : {path : "students", select : "username profileImage"},
            page:   page, 
            limit:    5,
            sort: {
                date : "desc"
            }
        },
        reports = await Report.paginate({associationId : teacher.associationId}, options)
        data = []
        if (reports.docs.length > 0) {
            for (var i = 0; i < reports.docs.length; i ++) {
                var text = "Draft"
                if ( reports.docs[i].answers.length > 0) {
                    for (var n = 0; n < reports.docs[i].answers.length; n ++) {
                        if (reports.docs[i].answers[n].answer != "") {
                            text = reports.docs[i].answers[n].answer
                        }
                    }
                }
                var isPublished = false
                if (reports.docs[i].status == 3) {
                    isPublished = true
                }
                data.push({
                    _id : reports.docs[i]._id,
                    profileImage : teacher.profileImage,
                    date : reports.docs[i].date,
                    sent : reports.docs[i].sent,
                    students : reports.docs[i].students,
                    text,
                    isPublished
                })
            }
        }
        reports.docs = data
    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        reports
    })
}

// get latest reports
exports.getLatestMedicalReports = async (req, res) => {
    var teacherId = req.userData.userId,
        teacher = await Teachers.findById(teacherId).select("profileImage associationId"),
        page = req.params.page,
        options = {
            select : 'date status question2 sent',
            page:   page, 
            limit:    5,
            sort: {
                date : -1
            }
        },
        reports = await MedicalReport.paginate({associationId : teacher.associationId}, options)
        data = []
        if (reports.docs.length > 0) {
            for (var i = 0; i < reports.docs.length; i ++) {
                var text = "Draft"
                if ( reports.docs[i].question2.answer != "") {
                    text = reports.docs[i].question2.answer
                }
                data.push({
                    _id : reports.docs[i]._id,
                    profileImage : teacher.profileImage,
                    date : reports.docs[i].date,
                    sent : reports.docs[i].sent,
                    text
                })
            }
        }
        reports.docs = data
    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        reports
    })
}

// get portal questions
exports.getPortalQuestions = async (req, res) => {
    var teacherId = req.userData.userId,
        lang = req.headers.lang,
        teacher = await Teachers.findById(teacherId).select('associationId'),
        data = await Questions.find({associationId : teacher.associationId, deleted : false}).sort({sort : 1}).select(`question options questionType`)

    

    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })
}

// update daily report
exports.updateQuestionDailyReport = async (req, res) => {
    var reportId = req.body.reportId,
        questionId = req.body.question,
        answerBody = req.body.answer,
        report = await Report.findById(reportId).select('answers associationId'),
        question = await Questions.find({associationId : report.associationId, deleted : false})
        answeredQ = await Questions.findById(questionId).select('question questionType')

        // console.log(answer)
    if (questionId && answerBody) {
        if (report.answers.length > 0) {
            for (var i = 0; i < report.answers.length; i ++) {
                if (answeredQ.questionType == 2 || answeredQ.questionType == 3) {
                    if (report.answers[i].question._id == questionId) {
                        for (var n =0; n < report.answers[i].options.length; n ++) {
                            if (answerBody.includes(report.answers[i].options[n].value)) {
                                report.answers[i].options[n].selected = true
                            }else {
                                report.answers[i].options[n].selected = false
                            }
                        }
                    }
                }else {
                    if (report.answers[i].question._id == questionId) {
                        report.answers[i].answer = answerBody[0]
                    }
                }
                
            }
        }else {
            for (var i = 0; i < question.length; i ++) {
                var options = [],
                    answer = ""
                if (question[i].questionType == 2 || answeredQ.questionType == 3) {
                    if (questionId == question[i].id) {
                        for (var n = 0; n < question[i].options.length; n ++) {
                            var selected = false
                            
                            if (answerBody.includes(question[i].options[n].option)) {
                                selected = true
                            }
                                
                                
                            options.push({
                                selected : selected,
                                value : question[i].options[n].option,
                                icon : question[i].options[n].icon
                            })
                        }
                    }
                }else {
                    answer = answerBody[0]
                }
                report.answers.push({
                    question : {
                        _id : question[i].id,
                        value : question[i].question
                    },
                    options : options,
                    answer : answer
                })
            }
        }
        
        
        report.save((err) => {
            if (err) {
                return res.status(409).json({
                    message : "saved error",
                    status : 409
                })
            }

            return res.status(200).json({
                message : "Done successfully",
                status : 200
            })
        })
    }else {
        return res.status(403).json({
            message : "questions && answers are required",
            status : 403
        })
    }
}

// get report data
exports.getReportData = async (req, res) => {
    var reportId = req.params.reportId
    var report = await Report.findById(reportId).select('answers status associationId students date').populate([{path : "students", select : "profileImage username"}])
        question = await Questions.find({associationId : report.associationId, deleted : false}).sort({sort : 1})
    if (report) {
        if (report.answers.length == 0) {
            for (var i = 0; i < question.length; i ++) {
                var options = [],
                    answer = ""
                    
                if (question[i].questionType == 2 || question[i].questionType == 3) {
                    // if (questionId == question[i].id) {
                        for (var n = 0; n < question[i].options.length; n ++) {
                            var selected = false
                                
                            options.push({
                                selected : selected,
                                value : question[i].options[n].option,
                                icon : question[i].options[n].icon
                            })
                        }
                    // }
                }
                console.log(question[i].questionType)
                report.answers.push({
                    question : {
                        _id : question[i].id,
                        value : question[i].question
                    },
                    options : options,
                    questionType : question[i].questionType,
                    answer : answer
                })
            }

            report.save(err => {
                if (err) throw err
            })
        }
        var data = {
            date : report.date,
            students : report.students,
            status : report.status,
            answers : report.answers
        }
        return res.status(200).json({
            message : "Done successfully",
            status : 200,
            data
        })
    }else {
        return res.status(409).json({
            message : "no report",
            status : 409
        })
    }
        
}

// publish report
exports.publishReport = async (req, res) => {
    var teacherId = req.userData.userId,
        reportId = req.body.reportId,
        lang = req.headers.lang,
        translation = eval(lang),
        report = await Report.findOne({_id : reportId, teacher : teacherId}).select('status students associationId')

    if (report) {
        report.status = 3
        report.save(async (err) => {
            if (err) {
                return res.status(409).json({
                    message : "saved error",
                    status : 409
                })
            }

            if (report.students.length > 0) {
                var parents = await Students.find({'_id' : { "$in" : report.students}}).distinct('parentId'),
                    tokens = await Users.find({'_id' : { "$in" : parents }}).distinct('fcmToken')
                
                var message = {
                    registration_ids: tokens,
                    notification: {
                        title: translation.dailyReport, 
                        body: translation.DailyReportPublished
                    },
                    data: {  
                        reportId: reportId,
                    }
                }
    
                fcm.send(message, function(err, response){
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("Successfully sent with response: ", response)
                    }
                })

                if (parents && parents.length > 0) {
                    for (var i = 0; i < parents.length; i ++) {
                        var notificationData = {
                            title_en : en.dailyReport,
                            title_ar : ar.dailyReport,
                            body_en : en.DailyReportPublished,
                            body_ar : ar.DailyReportPublished,
                            type : 2, // daily
                            associationId : report.associationId,
                            userId : parents[i],
                            related : reportId,
                            icon : 'https://res.cloudinary.com/keraapp/image/upload/daily_report.png',
                            date : new Date().getTime()
                        }
        
                        Notifications(notificationData).save()
                    }
                }
                
            }

            return res.status(200).json({
                message : "Done successfully",
                status : 200
            })
        })
    }else {
        return res.status(409).json({
            message : "no report or no access",
            status : 409
        })
    }
}

// publish medical report
exports.publishMedicalReport = async (req, res) => {
    var teacherId = req.userData.userId,
        reportId = req.body.reportId,
        lang = req.headers.lang,
        translation = eval(lang),
        report = await MedicalReport.findOne({_id : reportId, teacher : teacherId}).select('status students associationId')

    if (report) {
        report.status = 3
        report.save(async (err) => {
            if (err) {
                return res.status(409).json({
                    message : "saved error",
                    status : 409
                })
            }

            if (report.students.length > 0) {
                var parents = await Students.find({'_id' : { "$in" : report.students}}).distinct('parentId'),
                    tokens = await Users.find({'_id' : { "$in" : parents }}).distinct('fcmToken')
                
                var message = {
                    registration_ids: tokens,
                    notification: {
                        title: translation.medicalReport, 
                        body: translation.medicalReportPublished
                    },
                    data: {  
                        reportId: reportId,
                    }
                }
    
                fcm.send(message, function(err, response){
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("Successfully sent with response: ", response)
                    }
                })

                if (parents && parents.length > 0) {
                    for (var i = 0; i < parents.length; i ++) {
                        var notificationData = {
                            title_en : en.medicalReport,
                            title_ar : ar.medicalReport,
                            body_en : en.medicalReportPublished,
                            body_ar : ar.medicalReportPublished,
                            type : 1, // daily
                            associationId : report.associationId,
                            userId : parents[i],
                            related : reportId,
                            icon : 'https://res.cloudinary.com/keraapp/image/upload/medical-notification_gxufse.png'
                        }
        
                        Notifications(notificationData).save()
                    }
                }
                
            }

            return res.status(200).json({
                message : "Done successfully",
                status : 200
            })
        })
    }else {
        return res.status(409).json({
            message : "no report or no access",
            status : 409
        })
    }
}

// create mediacl report
exports.postMedicalReport = async (req, res) => {
    var post = req.body,
        teacherId = req.userData.userId,
        teacher = await Teachers.findById(teacherId).select('associationId'),
        medicalQuestions = await MedicalQuestion.findOne({associationId : teacher.associationId})
        console.log(teacher.associationId)
    if (post.students) {
        post.teacher = teacherId
        post.associationId = teacher.associationId
        if (medicalQuestions) {
            post.question1 = medicalQuestions.question1
            post.question2 = medicalQuestions.question2
            post.images = []
            MedicalReport(post).save(async (err, saved) => {
                if (err) {
                    return res.status(409).json({
                        message : "no reports",
                        status : 409
                    })
                }
                var report = await MedicalReport.findById(saved._id).select('_id teacherComments students date').populate([{path : "students", select : "profileImage username"}]),
                data = {
                    _id : report._id,
                    selectedStudents : report.students,
                    teacherComments : report.teacherComments,
                    date : report.date
                }

                return res.status(200).json({
                    message : "Done successfully",
                    status : 200,
                    data
                })
            })
        }else {
            return res.status(403).json({
                message : "There are no quastions added",
                status : 403
            })
        }
        
    }else {
        return res.status(403).json({
            message : "students is required",
            status : 403
        })
    }
}

// get medical report data
exports.getMedicalReportData = async (req, res) => {
    var reportId = req.params.reportId
    var report = await MedicalReport.findById(reportId).select('question1 question2 status images associationId students date').populate([{path : "students", select : "profileImage username"}])
    if (report) {
        
        var data = {
            date : report.date,
            students : report.students,
            status : report.status,
            question1 : report.question1,
            question2 : report.question2,
            images : report.images
        }
        return res.status(200).json({
            message : "Done successfully",
            status : 200,
            data
        })
    }else {
        return res.status(409).json({
            message : "no report",
            status : 409
        })
    }
        
}

// update medical report
exports.updateMedicalReport = async (req, res) => {
    var reportId = req.body.reportId,
        post = req.body,
        report = await MedicalReport.findById(reportId).select('question1 question2 images associationId')

    if (reportId) {
        if (post.question1) {
            if (post.question1 == "isYes") {
                report.question1.isYes = true
                report.question1.isNo = false
            }else {
                report.question1.isNo = true
                report.question1.isYes = false
            }
        }
    
        if (post.question2) {
            report.question2.answer = post.question2
        }

        report.save(err => {
            if (err) {
                return res.status(409).json({
                    message : "saved error",
                    status : 409
                })
            }
    
            return res.status(200).json({
                message : "Done successfully",
                status : 200
            })
        })
    }else {
        return res.status(403).json({
            message : "reportId are required",
            status : 403
        })
    }
}

// upload medical report image
exports.uploadMedicalReportImage = async (req, res) => {
    var reportId = req.body.reportId,
        image = req.body.image,
        report = await MedicalReport.findById(reportId).select('question1 question2 images associationId')

    if (reportId && image) {
        cloudinary.v2.uploader.upload(image, async (err , result)=>{
            if (err) {
                return res.status(409).json({
                    message : "saved cloudinary error",
                    status : 409
                })
            }
            // console.log(report)
            report.images.push(`https://res.cloudinary.com/keraapp/image/upload/${result.public_id}.${result.format}`)

            report.save(error => {
                if (error) {
                    return res.status(409).json({
                        message : "saved error",
                        status : 409
                    })
                }

                return res.status(200).json({
                    message : "Done successfully",
                    status : 200
                })
            })
        })
    }else {
        return res.status(403).json({
            message : "reportId are required",
            status : 403
        })
    }
}

// make student absent
exports.makeStudentAbsent = async (req, res) => {
    var report = await Report.findById(req.body.reportId)

    report.absent = req.absent
    report.save()

    return res.status(200).json({
        message : "Done successfully",
        status : 200
    })
}