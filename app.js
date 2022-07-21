/**
 * //== socket status ==//
 * 502 => order_bussy
 * 503 => notifyNearbyDrivers
 * 504 => notifyAcceptedOrder
 * 506 => notifyOrderCanceled
 */

var express = require('express')
var session = require('express-session')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var flash = require('connect-flash')
var Users = require('./Models/user')
var Drivers = require('./Models/driver')
var Trips = require('./Models/trip')
var jwt = require('jsonwebtoken')
var passport = require('passport')
// call dotenv
require('dotenv').config()
// connect to db
require("./connection")
const i18n = require('./localization')
const {backup} = require('./helpers/dbHelpers')
const path = require('path')
const ARCHIVE_PATH = path.join(__dirname, 'db')
var app = express()
var http = require('http')
var server = http.createServer(app)
var port = process.env.PORT || 9000;
console.log(port)
var io = require('socket.io')(server)

// mongoexport --uri mongodb+srv://kera:0185865167Isso@kera.lai3r.mongodb.net/kera-test --collection users --type json --out /home/islam/Documents/node-projects/kera/db/users.json --forceTableScan
// function backupMongoDb(collection, uri, extension) {
//   const child = spawn('mongoexport', [
//     `--uri=${uri}`,
//     `--collection=${collection}`,
//     `--type=${extension}`,
//     `--out=${ARCHIVE_PATH}/${collection}.${extension}`,
//     '--forceTableScan'
//   ])

//   child.stdout.on('data', (data) => {
//     console.log('stdout:\n', data)
//   })

//   child.stderr.on('data', (data) => {
//     console.log('stderr:\n', Buffer.from(data).toString())
//   })

//   child.on('error', (err) => {
//     console.log('error:\n', err)
//   })

//   child.on('exit', (code, signal) => {
//     if (code) {
//       console.log('process exit with cod:', code)
//     }else if(signal) {
//       console.log('process killed with signal:', signal)
//     }else {
//       console.log('backup created successfully')
//     }
//   })
// }



app.use(cookieParser())
app.use(i18n.init)


app.use(function (req, res, next) {
  
  if (!req.cookies.lang) {
    res.setHeader('Cache-Control', 'private');
    req.cookies.lang = "en"
  }
  next();
})

app.use(session({
  secret: 'keyboard cat',
  cookie: {maxAge: 500000000},
  resave: true,
  saveUninitialized: false
}))

// flash middleware
app.use(flash())

// Global vars
app.use(function(req , res , next){
  res.locals.requiredError = req.flash('requiredError'),
  req.io = io

  next()
})

app.get('/', (req, res) => {
  backup(ARCHIVE_PATH, 'mongodb+srv://kera:0185865167Isso@kera.lai3r.mongodb.net/kera-test', 'json')
  res.render("index")
})

app.set('view engine', 'ejs')
app.use(express.static('./assets'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb', parameterLimit: 50000 }))
 
// parse application/json
app.use(bodyParser.json())

// passport middleware
app.use(passport.initialize());
app.use(passport.session())

require('./jobs')

/**
 * routes
 */
var contactIndex = require('./Routes/contact')
app.use('/contact', contactIndex)
// association panel
// index
var index = require('./Routes/admin/index')
app.use('/association-panel', index)
// drivers
var drivers = require('./Routes/admin/drivers')
app.use('/association-panel/drivers', drivers)
// users
var users = require('./Routes/admin/users')
app.use('/association-panel/users', users)
// lines
var lines = require('./Routes/admin/lines')
app.use('/association-panel/lines', lines)
// buses
var buses = require('./Routes/admin/buses')
app.use('/association-panel/buses', buses)
// students
var students = require('./Routes/admin/students')
app.use('/association-panel/students', students)
// teachres
var teachres = require('./Routes/admin/teachers')
app.use('/association-panel/teachers', teachres)
// classes
var classes = require('./Routes/admin/classes')
app.use('/association-panel/classes', classes)
// educations
var educations = require('./Routes/admin/educations')
app.use('/association-panel/educations', educations)
// meals
var meals = require('./Routes/admin/meals')
app.use('/association-panel/meals', meals)
//settings
var settings = require('./Routes/admin/settings')
app.use('/association-panel/settings', settings)
//events
var events = require('./Routes/admin/events')
app.use('/association-panel/events', events)
//questions
var questions = require('./Routes/admin/questions')
app.use('/association-panel/questions', questions)
//reports
var reports = require('./Routes/admin/reports')
app.use('/association-panel/reports', reports)
// Notifications
var notifications = require('./Routes/admin/notifications')
app.use('/association-panel/notifications', notifications)

// super admin
// association
var association = require('./Routes/superAdmin/association')
app.use('/super-admin', association)


/**
 * apis
 */

// user
var userApi = require('./Routes/api/users')
app.use('/api/user', userApi)
// driver
var driverApi = require('./Routes/api/drivers')
app.use('/api/driver', driverApi)
// teacher
var teacherApi = require("./Routes/api/teachers")
app.use('/api/teacher', teacherApi)
// general
var generalApi = require("./Routes/api/general")
app.use('/api/general', generalApi)
// portal
var portalApi = require("./Routes/api/portal")
app.use('/api/portal', portalApi)
// class
var classApi = require("./Routes/api/classes")
app.use('/api/class', classApi)

/**
 * socket io
 */
global.connectedUsers = {},
global.drawRoute = function () {
  return false
}
require('socketio-auth')(io, {
  authenticate: async (socket, data, callback) => {
    var decoded = jwt.verify(data.token , 'secret'),
        phone = decoded.phone.value,
        id = decoded.userId
   
    var user = await Users.findOne({"phone.value" : phone, _id : id}),
        driver = await Drivers.findOne({"phone.value" : phone, _id : id})
      
      if (!user && !driver) return callback(new Error("User not found"));
  
      if (user) {
        
        connectedUsers[user._id] = {
          "socket": socket.id
        }
      }else {
        
        connectedUsers[driver._id] = {
          "socket": socket.id
        }
      }
  
      // update location
      socket.on("updateLocation", (data) => {
        if (data.tripId && data.longitude && data.latitude && data.location) {
            var tripId = data.tripId,
            longitude = Number(data.longitude),
            latitude = Number(data.latitude),
            address = data.location
            socket.join(tripId)
            
          // send location to room
          io.to(tripId).emit('locationRoom', {
            longitude : data.longitude,
            latitude : data.latitude
          })
      
          Trips.findById(tripId, (err, trip) => {
            if (err) throw err
            
            // console.log(trip)
            if (trip) {
              trip.location = {
                latitude,
                longitude,
                address : address
              }
              trip.tripRoute.push({
                latitude,
                longitude
              })
              trip.save(err => {
                if (err) throw err
              })
            }
            
          })
        }
      })

      
      // create location room
      // socket.on('locationRoom', async (room) => {
      //   socket.join(room.tripId)
      //   console.log(room.tripId)
        
      // })
      // show driver location
      socket.on("showDriverLocation", (data) => {
        var driverLatitude = JSON.stringify(data.latitude),
            driverLongitude = JSON.stringify(data.longitude),
            userId = data.userId

        if (connectedUsers[userId]) {
          io.to(connectedUsers[userId].socket).emit({
            driverLatitude,
            driverLongitude
          })
        }
      })
  
  },
  disconnect: disconnect,
  timeout: 1000000
})

function disconnect(socket) {
  console.log(socket.id + ' disconnected');
}

server.listen(port)

// Error Handler Middleware
app.use(function (err, req, res, next) {
  res.status(500).send({
      status: 500,
      message: err.message,
      errors : [],
      body: {}
  })
})