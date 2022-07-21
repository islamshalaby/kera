const jwt = require('jsonwebtoken')

module.exports = (req , res , next)=>{
    try {
        const token = req.session.token
        const decoded = jwt.verify(token , 'secret')
        req.adminData = decoded
        next();
    } catch (error){
        res.redirect('/super-admin/login')
    }
}