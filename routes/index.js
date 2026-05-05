const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
	if (req.session.user) return res.redirect('/home');
	res.render('landing', { title: 'Green Life - Plataforma de Sustentabilidade' });
});

module.exports = router;
