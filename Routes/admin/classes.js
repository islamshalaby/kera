var express = require('express'),
    router = express.Router(),
    associationAuth = require('../../middleware/associationAuth'),
    classesController = require('../../Controller/admin/classes')

    router.all('/*', associationAuth, (req, res, next) => {
        next()
    })

    // get classes
    router.get("/", classesController.getClasses)

    // post add new class
    router.post("/", classesController.postAddNewClass)

    // get delete class
    router.get("/delete/:classId", classesController.getDeleteClass)

    // update class
    router.post("/update/:id", classesController.updateClass)
    

    

module.exports = router