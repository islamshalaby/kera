var express = require('express'),
    router = express.Router(),
    associationAuth = require('../../middleware/associationAuth'),
    notificationsController = require('../../Controller/admin/notifications')

router.all('/*', associationAuth, (req, res, next) => {
    next()
})

// get send notification
router.get('/send', notificationsController.sendNotification)

// post send notification
router.post('/send', notificationsController.postNotification)

// get notifications
router.get('/:page', notificationsController.getNotifications)


module.exports = router