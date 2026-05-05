require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
var expressLayouts = require('express-ejs-layouts');

// Routers
var indexRouter = require('./routes/index');
var userRouter = require('./modules/user/userRoutes');
var categoryRouter = require('./modules/category/categoryRoutes');
var tipRouter = require('./modules/tip/tipRoutes');
var postRouter = require('./modules/post/postRoutes');
var commentRouter = require('./modules/comment/commentRoutes');
var likeRouter = require('./modules/like/likeRoutes');
var actionRouter = require('./modules/action/actionRoutes');
var favoriteRouter = require('./modules/favorite/favoriteRoutes');
var adminRouter = require('./modules/admin/adminRoutes');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views/pages'));
app.set('layout', path.join(__dirname, 'views/layouts/main'));
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sessão
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'DEFAULT_SECRET',
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 dia
	})
);
app.use(flash());

// Variáveis globais para todas as views (usuário logado e mensagens flash)
app.use((req, res, next) => {
	res.locals.messages = req.flash();
	res.locals.user = req.session.user || null;
	next();
});

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
app.use('/', indexRouter);
app.use('/', userRouter);
app.use('/', categoryRouter);
app.use('/', tipRouter);
app.use('/', postRouter);
app.use('/', commentRouter);
app.use('/', likeRouter);
app.use('/', actionRouter);
app.use('/', favoriteRouter);
app.use('/admin', adminRouter); // protegido por adminAuth dentro do router

// 404
app.use(function (req, res, next) {
	next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	res.status(err.status || 500);
	res.render('error');
});

// Inicialização do banco
const sequelize = require('./config/database');
require('./modules/user/userModel');
require('./modules/category/categoryModel');
require('./modules/tip/tipModel');
require('./modules/post/postModel');
require('./modules/comment/commentModel');
require('./modules/like/likeModel');
require('./modules/action/actionModel');
require('./modules/favorite/favoriteModel');
require('./modules/associations'); // associações entre models

// Conexão e sincronização (não roda em modo de teste)
if (process.env.NODE_ENV !== 'test') {
	sequelize
		.authenticate()
		.then(() => console.log('✅ Banco conectado'))
		.catch((err) => console.error('❌ Erro no banco: ', err));

	sequelize
		.sync({ alter: true })
		.then(() => console.log('✅ Banco sincronizado'))
		.catch((err) => console.error('❌ Erro ao sincronizar: ', err));

	console.log('---===========================---');
}

module.exports = app;
