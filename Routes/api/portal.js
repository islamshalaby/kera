var express = require("express"),
    router = express.Router(),
    portalController = require('../../Controller/api/portal'),
    userAuth = require('../../middleware/userAuth')

// get portal details
router.get('/single/:id', userAuth, portalController.portalDetails)

// get portals
router.get('/map', portalController.getPortalsOnMap)

// get portals
router.get('/:page', userAuth, portalController.getPortals)

// favorite
router.put('/favorite', userAuth, portalController.favorite)

// get class education
router.get('/education/:classId', userAuth, portalController.getEducations)

// get latest news
router.get('/latest/news/:id/:page', userAuth, portalController.getPortalLatestNews)

// post meal comment
router.put('/meals/comment', userAuth, portalController.postMealComment)

// get meal comments
router.get('/meals/comments/:mealId', userAuth, portalController.getMealComments)

// get class meals
router.get('/meals/:classId', userAuth, portalController.getMeals)

// get meal details
router.get('/meals/details/:mealId', userAuth, portalController.getMealDetails)

// get events
router.get('/events/:status/:page', portalController.getEvents)

// get event details
router.get('/events/:id', userAuth, portalController.getEventDetails)





module.exports = router