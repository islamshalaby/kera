var Admins = require('../Models/association'),
    Association =  require("../Models/association")
module.exports = async(req, res, next) => {
    
    if (req.user) {
        var association = await Association.findOne({_id : req.user._id, authType : 2}).select('image username _id')
        
        if (association) {
            req.profile = association
            var count = {}
            req.notifications = count
        }else {
            return res.redirect('/association-panel/login');
        }
        
        // count.contactsNotifications = await Contacts.countDocuments({seen : false})
        // count.ordersNotifications = await Orders.countDocuments({$and : [{$or : [{status : 1}, {status : 2}, {status : 3}, {status : 4}, {status : 5}, {status : 6}, {status : 7}, {status : 8}, {status : 9}, {status : 10}]}, {seen : false}]})
        // count.ratesNotifications = await Orders.countDocuments({status : 7, rateSeen : false ,$or : [{"sharerRate": { $ne: null }}, {"parkerRate": { $ne: null }}]})
        
    }else {
        return res.redirect('/association-panel/login');
    }

    next()
}