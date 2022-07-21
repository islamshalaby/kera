var Students = require("../../Models/student"),
    Parents = require('../../Models/user'),
    Classes = require("../../Models/class")

// get add new student
exports.getAddNewStudent = async (req, res) => {
    var parents = await Parents.find({associationId : req.user._id}).select("username _id"),
        classes = await Classes.find({associationId : req.user._id}).select("name")

    res.render("association/students_form", {
        parents,
        type : "new",
        classes,
        profile : req.profile
    })
}

// post add new student
exports.postAddNewStudent = (req, res) => {
    var post = req.body,
        files = req.files

    post.associationId = req.user._id
    Students.addNewStudent(post, files, () => {
        req.flash('requiredError', "name && student id && profile image && parent && class are required fields")
        res.redirect('back')
    }, (async (err, saved) => {
        if (err) throw err
        
        if (saved.parentId) {
            
            var parent = await Parents.findById(saved.parentId).select("students"),
                clss = await Classes.findById(saved.classId).select("students")

            parent.students.push(saved)
            
            parent.save()

            clss.students.push(saved)

            clss.save()
        }

        res.redirect('/association-panel/students/1')
    }))
}

// update all
exports.updateAll = async (req, res) => {
    var students = await Students.find()

    for (var i = 0; i < students.length; i ++) {
        students[i].deleted = false
        students[i].save()
    }

    res.redirect('back')
}

// get students
exports.getStudent = (req, res) => {
    var page = req.params.page,
        query = {associationId : req.user._id, deleted : false}

    if (req.query.name) {
        query.username = { $regex: '.*' + req.query.name + '.*', $options: 'i' }
    }
    Students.getStudents(query, page, (err, data) => {
        if (err) throw err

        res.render("association/students", {
            data : data.docs,
            pages : data.pages,
            currentPage : data.page,
            profile : req.profile
        })
    })
}

// get edit student
exports.getEditStudent = async (req, res) => {
    var parents = await Parents.find({associationId : req.user._id}).select("username _id"),
        classes = await Classes.find({associationId : req.user._id}).select("name"),
        id = req.params.id,
        data = await Students.findById(id)

    
    
    res.render("association/students_form", {
        parents,
        type : "edit",
        classes,
        data,
        profile : req.profile
    })
}

// post edit student
exports.postEditStudent = async (req, res) => {
    var post = req.body,
        files = req.files,
        id = req.params.id

        if (files[0]) {
            post.profileImage = `https://res.cloudinary.com/keraapp/image/upload/${files[0].public_id}.${files[0].format}`
        }
    var student = await Students.findById(id).select("parentId classId _id"),
        oldParent = await Parents.findOneAndUpdate({students : student._id}, {$pull : {students : student._id}}),
        oldCalss = await Classes.findOneAndUpdate({students : student._id}, {$pull : {students : student._id}})


    Students.findByIdAndUpdate(id, {$set : post}, async (err, saved) => {
        if (err) throw err

        var parent = await Parents.findById(post.parentId).select("students"),
            clss = await Classes.findById(post.classId).select("students")
            
            if (parent.students == false || parent.students.includes(saved._id) == false) {
                parent.students.push(saved)
            
                parent.save()
            }

            if (clss.students == false || clss.students.includes(saved._id) == false) {
                clss.students.push(saved)

                clss.save()
            }
        
        res.redirect("/association-panel/students/1")
    })

}

// get delete
exports.getDelete = async (req, res) => {
    var student = await Students.findById(req.params.id).select('_id deleted'),
        parent = await Parents.findOneAndUpdate({students : student._id}, {$pull : {students : student._id}}),
        calss = await Classes.findOneAndUpdate({students : student._id}, {$pull : {students : student._id}})

    student.deleted = true
    student.save()

    res.redirect('back')
}