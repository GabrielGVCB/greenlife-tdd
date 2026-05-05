const express = require('express');
const router = express.Router();
const controller = require('./actionController');
const auth = require('../../middlewares/auth');

router.get('/actions', auth, controller.list);
router.get('/actions/new', auth, controller.showNew);
router.post('/actions/new', auth, controller.create);
router.post('/actions/:id/delete', auth, controller.delete);

module.exports = router;
