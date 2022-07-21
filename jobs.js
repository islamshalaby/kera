const CronJob = require('cron').CronJob
const Events = require('./Models/event')
const moment = require('moment')

// update events at midnight
const job = new CronJob('0 */30 6-17 * * *', function() {
	const d = new Date();
	Events.find({eventType : 'upcoming'}).select('_id eventType date to').exec((err, data) => {
    if (err) throw err
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear()

    today = yyyy + '-' + mm + '-' + dd

    data = data.map(function (p) {
      
      if (moment(p.date).isBefore(today)) {
        p.eventType = "previous"
        p.save(err => {
          
        })
      }
    })
  })
});
console.log('After job instantiation');
job.start();