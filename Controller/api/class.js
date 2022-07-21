var Classes = require('../../Models/class'),
    Educations = require('../../Models/education'),
    Meals = require('../../Models/meal')

// get dates
exports.getDates = async (req, res) => {
    var classId = req.params.classId,
        data = await Educations.find({class : classId}).distinct('edDate')

    res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })
}

// get meals
exports.getMeals = async (req, res) => {
    var classId = req.params.classId,
        data = await Meals.find({class : classId}).distinct('mealDate')

    res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })
}