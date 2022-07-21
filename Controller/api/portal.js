const { json } = require('body-parser');
const { eventNames } = require('../../Models/event');
const meal = require('../../Models/meal');

/**
 * status
 * ------
 * 200 => success
 * 401 => invalid user
 * 403 => required fields
 * 450 => not permitted
 * 408 => user is blocked
 * 406 => email | phone is already exist
 * 409 => no data
 * 
 */
var jwt = require('jsonwebtoken'),
    Users = require('../../Models/user'),
    Associations = require('../../Models/association'),
    Educations = require('../../Models/education'),
    Meals = require('../../Models/meal'),
    News = require('../../Models/news'),
    Events = require("../../Models/event"),
    Teachers = require('../../Models/teacher'),
    ComplaintUsers = require("../../Models/complaintUser"),
    Posts = require('../../Models/post'),
    moment = require('moment'),
    multer = require("multer"),
    post = require('../../Models/post'),
    FCM = require('fcm-node'),
    serverKey = 'AAAAszCrw1w:APA91bF7J9b-Kk2Xxp_AaYQ27O-X4ABqvTL83tw5z-3EiNJ6aPQWIYrQiOEDgqkTBhhUZ01hEXkSYIzvaRx3mg5dO39569WoIhXtdnqwAcjweTtVeMYEK67ujtBaqIwLFQvx1rZ7MjYp',
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

// get portals
exports.getPortals = async (req, res) => {
    var lang = req.headers.lang,
        page = req.params.page,
        lastWeek = moment().add(-1, 'w'),
        previousEvents = await Events.find({date : {"$lt" : lastWeek}}).select('eventType')
    var options = {
        select : '_id username location image images type favorites tags favoritUsers short_description_' + lang,
        populate : [{path : 'type', select : 'title'}, {path : "tags", select : "title_" + lang}],
        page:   page, 
        limit:    5,
        sort: {
            _id : -1
        }
    }
    if (previousEvents) {
        for (var i = 0; i < previousEvents.length; i ++) {
            previousEvents[i].eventType = "previous"
            previousEvents[i].save()
        }
    }
    Associations.paginate({accepted : true, blocked : false, authType : 2}, options, (err, data) => {
        if (err) {
            return res.status(409).json({
                message : "no portals",
                status : 409
            })
        }

        data.docs = data.docs.map(function(p){
            
            var all = p.toAliasedFieldsObject(),
                tags = all.tag.map(function(t){
                    return t.toAliasedFieldsObject()
                }),
                isFavourite = false
            if (req.userData && all.favoritUsers.includes(req.userData.userId)) {
                isFavourite = true
            }
            var allData = {
                    username : all.username,
                    latitude : all.latitude,
                    longitude : all.longitude,
                    address : all.address,
                    logo : all.logo,
                    image : all.images[0],
                    type : all.type,
                    favorites : all.favorites,
                    shortDescription : all.shortDescription,
                    tags : tags,
                    _id : all._id,
                    isFavourite
                }
            
            return allData
        })

        return res.status(200).json({
            message : "Done successfully",
            status : 200,
            data
        })
    })
}

// get portals
exports.getPortalsOnMap = (req, res) => {
    var lang = req.headers.lang
    
    Associations.find({accepted : true, blocked : false, authType : 2}).populate([{path : 'type', select : 'title'}, {path : "tags", select : "title_" + lang}]).select('_id username location image images type favorites tags short_description_' + lang).sort({_id : -1}).exec((err, data) => {
        if (err) {
            return res.status(409).json({
                message : "no portals",
                status : 409
            })
        }

        data = data.map(function(p){
            var all = p.toAliasedFieldsObject(),
                tags = all.tag.map(function(t){
                    return t.toAliasedFieldsObject()
                }),
                allData = {
                    username : all.username,
                    latitude : all.latitude,
                    longitude : all.longitude,
                    address : all.address,
                    logo : all.logo,
                    image : all.images[0],
                    type : all.type,
                    favorites : all.favorites,
                    shortDescription : all.shortDescription,
                    tags : tags,
                    _id : all._id
                }
            
            return allData
        })

        return res.status(200).json({
            message : "Done successfully",
            status : 200,
            data
        })
    })
}

// favorite
exports.favorite = (req, res) => {
    var id = req.body.portalId,
        favorite = req.body.favorite
    if (req.userData) {
        Associations.findById(id, (err, data) => {
            var totalFavorites = 0
            if (favorite == 1) {
                totalFavorites = data.favorites + 1
                data.favoritUsers.push(req.userData.userId)
            }else {
                if (data.favorites > 0) {
                    totalFavorites = data.favorites - 1
                }
                var index = data.favoritUsers.indexOf(req.userData.userId);
                if (index >= 0) {
                    data.favoritUsers.splice(index, 1);
                }
            }
            data.favorites = totalFavorites
            
            data.save()
            if (err) {
                return res.status(409).json({
                    message : "no portal",
                    status : 409
                })
            }
            
            
            return res.status(200).json({
                message : "Done successfully",
                status : 200
            })
        })
    }else {
        return res.status(409).json({
            message : "auth required",
            status : 409
        })
    }
    
}

// portal details
exports.portalDetails = (req, res) => {
    var id = req.params.id,
        lang = req.headers.lang

    Associations.findById(id).select(`_id username slogan image type tags video location videoImage images phone favorites favoritUsers description_${lang}`).populate([{path : "type", select : "title"}, {path : "tags", select : "title_" + lang}]).exec((err, data) => {
        if (err) {
            return res.status(409).json({
                message : "no portal",
                status : 409
            })
        }
        
        data = data.toAliasedFieldsObject()
        var tags = data.tag.map(function(t){
                    return t.toAliasedFieldsObject()
                }),
            videoImage = {
                link : data.video,
                image : data.videoThumbnail
            },
            images = [],
            isFavourite = false

        images.push(videoImage)    
        for (var i = 0; i < data.images.length; i ++) {
            images.push({
                link : "",
                image : data.images[i]
            })
        }

        if (req.userData && data.favoritUsers.includes(req.userData.userId)) {
            isFavourite = true
        }

        allData = {
            username : data.username,
            slogan : data.slogan,
            type : data.type,
            // video : data.video,
            latitude : data.latitude,
            longitude : data.longitude,
            address : data.address,
            phones : data.phone,
            logo : data.logo,
            images,
            type : data.type,
            favorites : data.favorites,
            isFavourite,
            description : data.description,
            tags : tags,
            _id : data._id
        }

        return res.status(200).json({
            message : "Done successfully",
            status : 200,
            data : allData
        })
    })
}

// get educations
exports.getEducations = async (req, res) => {
    var classId = req.params.classId,
        userId = req.userData.userId,
        lang = req.headers.lang,
        data = {},
        filter = req.query,
        query = {class : classId}

    if (filter.fromDate || filter.toDate) {
        var dateTo = "",
            dateFrom = ""
        if (filter.fromDate) {
            dateFrom = new Date(filter.fromDate).getTime()
        }else {
            dateFrom = new Date().getTime()
        }
        if (filter.toDate) {
            dateTo = new Date(filter.toDate).getTime()
        }else {
            dateTo = new Date().getTime()
        }
        Date.prototype.addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }
        if (filter.fromDate == filter.toDate) {
            var date = new Date(filter.toDate),
                newDate = date.addDays(1)
            dateTo = new Date(newDate).getTime()
        }
        
        query.edDate = {$gte : dateFrom, $lte : dateTo}
    }
    data.educations = await Educations.find(query).select(`images edDate short_description_${lang} title_${lang}`)

    data.educations = data.educations.map(function (p) {
        return p.toAliasedFieldsObject()
    })
    
    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })
}

// get meals
exports.getMeals = async (req, res) => {
    var classId = req.params.classId,
        userId = req.userData.userId,
        lang = req.headers.lang,
        data = {},
        filter = req.query,
        query = {class : classId}

    if (filter.fromDate || filter.toDate) {
        var dateTo = "",
            dateFrom = ""
        if (filter.fromDate) {
            dateFrom = new Date(filter.fromDate).getTime()
        }else {
            dateFrom = new Date().getTime()
        }
        if (filter.toDate) {
            dateTo = new Date(filter.toDate).getTime()
        }else {
            dateTo = new Date().getTime()
        }
        Date.prototype.addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }
        if (filter.fromDate == filter.toDate) {
            var date = new Date(filter.toDate),
                newDate = date.addDays(1)
            dateTo = new Date(newDate).getTime()
        }
        console.log(process.env.TZ)
        query.mealDate = {$gte : dateFrom, $lte : dateTo}
    }
    data.Meals = await Meals.find(query).select(`images mealDate mainImage meal_name_${lang} short_description_${lang} title_${lang}`)

    data.Meals = data.Meals.map(function (p) {
        return p.toAliasedFieldsObject()
    })
    
    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })
}

// get meal details
exports.getMealDetails = async (req, res) => {
    var lang = req.headers.lang,
        mealId = req.params.mealId,
        data = await Meals.findById(mealId).select(`images mealDate meal_name_${lang} tinyImage description_${lang} title_${lang}`)

    data = data.toAliasedFieldsObject()

    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })
}

// post meal comment
exports.postMealComment = async (req, res) => {
    var lang = req.headers.lang,
        mealId = req.body.mealId,
        userId = req.userData.userId,
        content = req.body.content,
        date = new Date().getTime(),
        studentId = req.body.studentId,
        meal = await Meals.findById(mealId).select('comments'),
        newComment = {
            "content" : content,
            "date" : date,
            "publisher" : userId,
            "student" : studentId
        }

    meal.comments.push(newComment)
    meal.save((err)=> {
        if (err) {
            return res.status(409).json({
                message : "no meal",
                status : 409
            })
        }

        return res.status(200).json({
            message : "Done successfully",
            status : 200
        })
    })

    
}

// get meal comments
exports.getMealComments = async (req, res) => {
    var userId = req.userData.userId,
        mealId = req.params.mealId,
        meal = await Meals.findById(mealId).select('comments').populate([{path : "comments.publisher", select : "username profileImage"}, {path : "comments.student", select : "username profileImage"}]),
        data = meal.comments

    
    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })

}

// get portal latest news
exports.getPortalLatestNews = async (req, res) => {
    var userId = req.userData.userId,
        id = req.params.id,
        lang = req.headers.lang,
        page = req.params.page,
        options = {
            select : `associationId date description_${lang}`,
            populate : {path: 'associationId', select : 'image'},
            page:   page, 
            limit:    5,
            sort: {
                _id : -1
            }
        },
        data = await News.paginate({associationId : id}, options)

    data.docs = data.docs.map(function(p) {
        return p.toAliasedFieldsObject()
    })

    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })
}

// get events
exports.getEvents = async (req, res) => {
    var status = req.params.status,
        lang = req.headers.lang,
        page = req.params.page,
        options = {
            select : `mainImage date title_${lang} short_description_${lang} location`,
            page:   page, 
            limit:    5,
            sort: {
                date : -1
            }
        },
        data = await Events.paginate({eventType : status}, options)

    if (data) {
        data.docs = data.docs.map(function (p) {
            return p.toAliasedFieldsObject()
        })
    }

    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })
}

// get event details
exports.getEventDetails = async (req, res) => {
    var id = req.params.id,
        lang = req.headers.lang,
        data = await Events.findById(id).populate({path : 'students.student', select : `profileImage`}).select(`title_${lang} images description_${lang} date students location price from to link`),
        newStudents = []
       
        data = data.toAliasedFieldsObject()
        if (req.userData) {
            var userId = req.userData.userId,
            parent = await Users.findById(userId).distinct('students')
            parent = parent.map(function (p) {
                return JSON.stringify(p)
            })
         
            if (parent.length > 0) {
                for (var i = 0; i < data.students.length; i ++) {
                    if (parent.includes(JSON.stringify(data.students[i].student._id))) {
                        newStudents.push(data.students[i])
                    }
                }
            }else {
                newStudents = data.students
            }
        }else {
            newStudents = data.students
        }
    // console.log(newStudents)
    data.students = newStudents

    return res.status(200).json({
        message : "Done successfully",
        status : 200,
        data
    })
}