const express = require('express');
const router = express.Router();
const controller = require('./categoryController');

// Públicas
router.get('/home', controller.showHome);
router.get('/category/:slug', controller.showCategory);

module.exports = router;
