var Questions = require('../../Models/question'),
    MedicalQuestion = require('../../Models/medicalQuestion')

// get add question
exports.getAddQuestion = (req, res) =>{
    res.render("association/questions_form", {
        type : "new",
        profile : req.profile
    })
}

// get medical question
exports.getMedicalQuestion = async (req, res) =>{
    var data = await MedicalQuestion.findOne({associationId : req.user._id})

    res.render("association/medical_questions_form", {
        type : "new",
        profile : req.profile,
        data
    })
}

// update medical questions
exports.updateMedicalQuestions = async (req, res) => {
    var post = req.body,
        data = await MedicalQuestion.findOne({associationId : req.user._id})
    
    if (data) {
        data.question1.question = post.question1
        data.question2.question = post.question2

        data.save(err => {
            if (err) throw err
        })
    }else {
        post = {
            question1 : {
                question : post.question1
            },
            question2 : {
                question : post.question2
            }
        }

        MedicalQuestion(post).save(err => {
            if (err) throw err
        })
    }

    res.redirect('back')
}

// get add daily question
exports.getAddDailyQuestion = (req, res) =>{
    res.render("association/daily_questions_form", {
        type : "new",
        profile : req.profile
    })
}

// post add daily question
exports.postAddDailyQuestion = (req, res) =>{
    var post = req.body,
        files = req.files,
        options = []

    post.associationId = req.user._id
    if (post.option && post.option.length > 0) {
        for (var i = 0; i < post.option.length; i ++) {
            var obj = {
                option : post.option[i]
            }
            if (files[i]) {
                obj.icon = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
            }
            options.push(obj)
        }
    }
    post.options = options

    Questions(post).save(err => {
        if (err) throw err
    })

    res.redirect('back')
}