var express = require('express')
var router = express.Router()
var indexController = require('../../Controller/admin/index')
var adminAuth = require('../../middleware/associationAuth')
var passport = require('passport')

// get login
router.get('/login', indexController.getLogin)

// post login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/association-panel',
    failureRedirect: '/association-panel',
    failureFlash: true,
    failureFlash: 'Invalid username or password.' 
}))

// get logout
router.get('/logout' , (req , res)=>{
    req.logout()
    res.redirect('/association-panel')
   
})
// set language
router.get('/lang/:lang', (req, res) => {

    res.cookie('lang', req.params.lang);
    
    res.redirect('back')
})
// get index
router.get('/', adminAuth, indexController.getIndex)


module.exports = router