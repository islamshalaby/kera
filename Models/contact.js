const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var contactSchema = mongoose.Schema({
    parent : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users"
    },
    subject : String,
    associationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "associations"
    },
    message : String,
    contactType : {
        type : Number,
        default : 1 // 2 => association
                    // 1 => app
    },
    date : {
        type: String, default: Date.now()
    }
})

contactSchema.plugin(mongoosePaginate)
var Contacts = module.exports = mongoose.model('contacts', contactSchema)