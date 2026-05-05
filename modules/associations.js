/**
 * Centraliza todas as associações entre Models.
 * Importado uma única vez em app.js depois de todos os models.
 */
const User = require('./user/userModel');
const Category = require('./category/categoryModel');
const Tip = require('./tip/tipModel');
const Post = require('./post/postModel');
const Comment = require('./comment/commentModel');
const Like = require('./like/likeModel');
const Action = require('./action/actionModel');
const Favorite = require('./favorite/favoriteModel');

// =============== Category 1:N Tip / Post / Action ===============
Category.hasMany(Tip, { foreignKey: 'categoryId', as: 'tips' });
Tip.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Category.hasMany(Post, { foreignKey: 'categoryId', as: 'posts' });
Post.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Category.hasMany(Action, { foreignKey: 'categoryId', as: 'actions' });
Action.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// =============== User 1:N (autoria) ===============
User.hasMany(Tip, { foreignKey: 'authorId', as: 'authoredTips' });
Tip.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

User.hasMany(Action, { foreignKey: 'userId', as: 'actions' });
Action.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// =============== Post 1:N Comment ===============
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// =============== Likes (N:N User <-> Post via Like) ===============
User.belongsToMany(Post, { through: Like, foreignKey: 'userId', as: 'likedPosts' });
Post.belongsToMany(User, { through: Like, foreignKey: 'postId', as: 'likedBy' });

Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// =============== Favorites (N:N User <-> Tip via Favorite) ===============
User.belongsToMany(Tip, { through: Favorite, foreignKey: 'userId', as: 'favoriteTips' });
Tip.belongsToMany(User, { through: Favorite, foreignKey: 'tipId', as: 'favoritedBy' });

// =============== Tip 1:N Action (opcional) ===============
Tip.hasMany(Action, { foreignKey: 'tipId', as: 'actions' });
Action.belongsTo(Tip, { foreignKey: 'tipId', as: 'tip' });

module.exports = {
	User,
	Category,
	Tip,
	Post,
	Comment,
	Like,
	Action,
	Favorite
};
