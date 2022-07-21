var jwt = require('jsonwebtoken')

module.exports = (req , res , next)=>{
    try {        
        if (req.headers.authorization == "kera-app") { // visitor
            next();
        }else {
            const token = req.headers.authorization.split(" ")[1]   
            const decoded = jwt.verify(token , 'secret')
            req.userData = decoded
            
            next();
        }
        
    } catch (error){
        return res.status(401).json({statusMessage : "Auth Failed"})
    }
}