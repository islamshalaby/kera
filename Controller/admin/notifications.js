var Notifications = require('../../Models/notification'),
    FCM = require('fcm-node'),
    serverKey = 'AAAAt2s7WE8:APA91bEWFQGzDhGphYFdTY2ld4QBsutpWqWLdohShHCRGk8pqqfgwmbpBS82ntBciwkiLIhwkJREvcgOLVX32irbgjxhgcukpXvwtr_LnVCzDs6EfwqvipV7PbnLBtaVEaoe8p6JhFR_',
    fcm = new FCM(serverKey),
    Users = require('../../Models/user'),
    Teachers = require('../../Models/teacher'),
    moment = require('moment')

// get notifications
exports.getNotifications = (req, res) => {
    var page = req.params.page
    
    Notifications.getNotifications({associationId : req.user._id}, page, (err, notifications) => {
        if (err) throw err

        res.render('association/notifications', {
            data : notifications.docs,
            profile : req.profile,
            moment
        })
    })
}

// get send notification
exports.sendNotification = (req, res) => {
    res.render('association/notifications_form', {
        profile : req.profile
    })
}

// post send notification
exports.postNotification = async (req, res) => {
    var post = req.body,
        usersTokens = [],
        users = await Users.find({associationId : req.user._id}).distinct("fcmToken"),
        teachers = await Teachers.find({associationId : req.user._id}).distinct("fcmToken")
    
    post.title_en = post.title
    post.title_ar = post.title
    post.body_en = post.body
    post.body_ar = post.body
    post.associationId = req.user._id,
    post.type = 3 // admin
    post.icon = 'https://res.cloudinary.com/keraapp/image/upload/general-notification_qhjdov.png'
    post.date = new Date().getTime()
    usersTokens = users
    
    var parentsIds = await Users.find({associationId : req.user._id}).distinct("_id")

    if (parentsIds.length > 0) {
        for (var i = 0; i < parentsIds.length; i ++) {
            post.userId = parentsIds[i]
            Notifications(post).save(err => {
                if (err) throw err
            })
        }
    }
    

    var message = { 
        registration_ids: usersTokens,         
        notification: {
            title: post.title, 
            body: post.body ,
            sound: "default"
        }
    };


    fcm.send(message, function(err, response){
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully sent with response: ", response);
        }
    })

    res.redirect('/association-panel/notifications/1')
}