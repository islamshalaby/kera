const { post } = require('../../Routes/admin')

var Events = require('../../Models/event'),
    Students = require('../../Models/student'),
    key = "AIzaSyCMSfq40Bo2KuQvQVSQE1gmmgJdxEbDS0Y",
    NodeGeocoder = require('node-geocoder'),
    moment = require('moment'),
    options = {
        provider: 'google',
    
        // Optional depending on the providers
        apiKey: key, // for Mapquest, OpenCage, Google Premier
        formatter: null         // 'gpx', 'string', ...
    },
    geocoder = NodeGeocoder(options)

// get events
exports.getEvents = async (req, res) => {
    var page = req.params.page,
        options = {
            page : page,
            limit :    50,
            select : '_id title_en date location mainImage',
            sort: {
                _id : -1
            }
        },
        data = await Events.paginate({deleted : false}, options)
        
    res.render("association/events", {
        data : data.docs,
        profile : req.profile,
        moment
    })
}

// get add event
exports.getAddEvent = (req, res) => {
    res.render("association/event_form", {
        type : "new",
        profile : req.profile
    })
}

// post add event
exports.postAddEvent = async (req, res) => {
    if (req.body.latitude && req.body.longitude && req.files && req.body.title_en && req.body.title_ar && req.body.title_ar && req.body.date && req.body.from && req.body.to && req.body.short_description_en && req.body.short_description_ar && req.body.description_en && req.body.description_ar) {
        var post = req.body,
        files = req.files,
        images = [],
        students = await Students.find({associationId : req.user._id}).distinct("_id"),
        mainImage = "",
        allStd = [],
        address = await geocoder.reverse({lat:Number(post.latitude), lon:Number(post.longitude)})
                        // cars.address = address[0].formattedAddress

        if (files && files.length > 0) {
            for (var i =0; i < files.length; i ++) {
                var singleImage = ""
                if (files[i].fieldname == 'mainImage') {
                    mainImage =`https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                }
                if (files[i].fieldname == 'images') {
                    singleImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                    images.push(singleImage)
                }
            }
        }
        if (students && students.length > 0) {
            allStd = students.map(function (p) {
                var singleStd = {
                    student : p,
                    accept : false
                }
                return singleStd
            })
        }
        
        post.mainImage = mainImage
        post.images = images
        post.associationId = req.user._id
        post.location = {
            latitude : post.latitude,
            longitude : post.longitude,
            address : address[0].formattedAddress
        }
        post.students = allStd
        
        Events(post).save(err => {
            if (err) throw err

            res.redirect('/association-panel/events/1')
        })
    }else {
        req.flash('requiredError', "location && title_en && title_ar && date && from && to && short_description_en && short_description_ar && description_en && description_ar && images are required fields")
        res.redirect('back')
    }
}

// get edit education
exports.getEditEvent = async (req, res) => {
    var eventId = req.params.eventId,
        data = await Events.findById(eventId)
    

    res.render("association/event_form", {
        data,
        type : "edit",
        profile : req.profile,
        moment
    })
}

// update event
exports.updateEvent = async (req, res) => {
    var eventId = req.params.eventId,
        event = await Events.findById(eventId),
        post = req.body,
        files = req.files
    
    
    if (files && files.length > 0) {
        for (var i =0; i < files.length; i ++) {
            var singleImage = ""
            if (files[i].fieldname == 'images') {
                singleImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
                
                
                event.images.push(singleImage)
            }
            if (files[i].fieldname == 'mainImage') {
                event.mainImage = `https://res.cloudinary.com/keraapp/image/upload/${files[i].public_id}.${files[i].format}`
            }
            
        }
    }
    event.date = post.date
    event.title_en = post.title_en
    event.title_ar = post.title_ar
    event.meal_name_en = post.meal_name_en
    event.meal_name_ar = post.meal_name_ar
    event.description_en = post.description_en
    event.description_ar = post.description_ar
    event.short_description_en = post.short_description_en
    event.short_description_ar = post.short_description_ar
    event.location = {
        latitude : post.latitude,
        longitude : post.longitude
    }
    event.price = post.price
    event.from = post.from
    event.to = post.to
    event.link = post.link
    event.save()
    

    res.redirect('back')
}

// get delete image
exports.getDeleteImage = async (req, res) => {
    var imageId = req.params.imageId,
        eventId = req.params.eventId,
        ed = await Events.findById(eventId)
        meal = await Events.findOneAndUpdate({_id : eventId}, {$pull : { images: ed.images[imageId] }})

    res.redirect('back')
}

// delete event
exports.deleteEvent = async(req, res) => {
    var id = req.params.eventId,
        event = await Events.findByIdAndUpdate(id, {$set : {deleted : true}})

    res.redirect('back')
}