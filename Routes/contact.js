var express = require('express'),
    router = express.Router(),
    nodemailer = require("nodemailer")

  // post contact
  router.post('/', (req, res) => {
    var post = req.body
    console.log(post)
    async function main(){
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: 'terliveapp@gmail.com', // generated ethereal user
              pass: 'terlive@0000' // generated ethereal password
          }
      });
  
      // send mail with defined transport object
      let info = {
          from: '<info@terlive.com>', // sender address
          to: 'info@terlive.com', // list of receivers
          subject: "Terlive App ✔", // Subject line
          text: "Terlive App", // plain text body
          html: 
          `<h1>New Message</h1>
          <p>Name: ${post.name}</p>
          <p>email: ${post.email}</p>
          <p>text: ${post.text}</p>
          `
      }
  
        transporter.sendMail(info, (err, info) => {
            if (err) {
                console.log('error')
            }else {
                console.log('mail sent successfully')
            }
  
        })
    }
    main().catch(console.error);
    res.redirect('/')
  })

module.exports = router