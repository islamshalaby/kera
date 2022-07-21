var express = require("express"),
    router = express.Router(),
    classController = require('../../Controller/api/class'),
    userAuth = require('../../middleware/userAuth')

// get class dates
router.get('/dates/:classId', classController.getDates)

// get class meals dates
router.get('/meals/dates/:classId', classController.getMeals)




module.exports = router