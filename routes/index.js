var express             = require('express');
var router              = express.Router();
const begin_endpoint    = require('./begin_endpoint');
const movement_endpoint = require('./movement_endopint');

router.post('/begin', begin_endpoint.post);

router.put('/movement', movement_endpoint.put);

module.exports = router;
