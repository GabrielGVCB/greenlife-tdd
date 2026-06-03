import 'dotenv/config';
import createError from 'http-errors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import flash from 'connect-flash';
import session from 'express-session';
import expressLayouts from 'express-ejs-layouts';

import indexRouter from './routes/index.js';
import userRouter from './modules/user/userRoutes.js';
import categoryRouter from './modules/category/categoryRoutes.js';
import tipRouter from './modules/tip/tipRoutes.js';
import postRouter from './modules/post/postRoutes.js';
import commentRouter from './modules/comment/commentRoutes.js';
import likeRouter from './modules/like/likeRoutes.js';
import actionRouter from './modules/action/actionRoutes.js';
import favoriteRouter from './modules/favorite/favoriteRoutes.js';
import adminRouter from './modules/admin/adminRoutes.js';

import sequelize from './config/database.js';
import './modules/user/userModel.js';
import './modules/category/categoryModel.js';
import './modules/tip/tipModel.js';
import './modules/post/postModel.js';
import './modules/comment/commentModel.js';
import './modules/like/likeModel.js';
import './modules/action/actionModel.js';
import './modules/favorite/favoriteModel.js';
import './modules/associations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('views', path.join(__dirname, 'views/pages'));
app.set('layout', path.join(__dirname, 'views/layouts/main'));
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
	session({
		secret: process.env.SESSION_SECRET || 'DEFAULT_SECRET',
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 1000 * 60 * 60 * 24 }
	})
);
app.use(flash());

app.use((req, res, next) => {
	res.locals.messages = req.flash();
	res.locals.user = req.session.user || null;
	next();
});

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', userRouter);
app.use('/', categoryRouter);
app.use('/', tipRouter);
app.use('/', postRouter);
app.use('/', commentRouter);
app.use('/', likeRouter);
app.use('/', actionRouter);
app.use('/', favoriteRouter);
app.use('/admin', adminRouter);

app.use(function (req, res, next) {
	next(createError(404));
});

app.use(function (err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	res.status(err.status || 500);
	res.render('error');
});

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

export default app;
