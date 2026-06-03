import express from 'express';
const router = express.Router();

router.get('/', function (req, res, next) {
	if (req.session.user) return res.redirect('/home');
	res.render('landing', { title: 'Green Life - Plataforma de Sustentabilidade' });
});

router.get('/health', function (req, res) {
	res.json({ status: true, message: 'ok', timestamp: new Date().toISOString() });
});

export default router;
