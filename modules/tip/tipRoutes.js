const express = require('express');
const router = express.Router();
const controller = require('./tipController');

router.get('/tip/:id', controller.show);

module.exports = router;
