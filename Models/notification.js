const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate'),
    fieldsAliasPlugin = require('mongoose-aliasfield')
var notificationSchema = mongoose.Schema({
    title_en : {
        type : String,
        alias : "title"
    },
    title_ar : {
        type : String,
        alias : "title"
    },
    body_en : {
        type : String,
        alias : "body"
    },
    body_ar : {
        type : String,
        alias : "body"
    },
    related : {
        type : String,
        alias : "relatedId"
    },
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users"
    },
    teacherId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "teachers"
    },
    icon : {
        type : String,
        alias : "notificationIcon"
    },
    type : {
        type : String,
        alias : "notificationType"
    },  // 1 => medical
        // 2 => daily
        // 3 => admin
    date : {
        type : String,
        alias : "NotificationDate",
        default: Date.now()
    }
}, { timestamps: true })
notificationSchema.plugin(fieldsAliasPlugin)
notificationSchema.plugin(mongoosePaginate)
var Notifications = module.exports = mongoose.model('notification', notificationSchema)

// get notifications
module.exports.getNotifications = (query, page, callback) => {
    var options = {
        page:   page,
        limit:    50,
        sort: {
            _id : -1
        }
    }
    Notifications.paginate(query, options, callback)
}