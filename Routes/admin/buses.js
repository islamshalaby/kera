var express = require('express'),
    router = express.Router(),
    associationAuth = require('../../middleware/associationAuth'),
    busesController = require('../../Controller/admin/buses')

    router.all('/*', associationAuth, (req, res, next) => {
        next()
    })

    // get buses
    router.get('/', busesController.getBuses)

    // post buses
    router.post('/', busesController.postAddNewBus)

    // delete bus
    router.get("/delete/:id", busesController.deleteBus)

module.exports = router