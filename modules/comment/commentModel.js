const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Comentário em um Post da comunidade.
 * O texto é sempre exibido com <%= %> (escape) — cobre R-07 (XSS).
 */
const Comment = sequelize.define(
	'Comment',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		text: {
			type: DataTypes.STRING(500),
			allowNull: false
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		postId: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	},
	{
		tableName: 'comments',
		paranoid: true
	}
);

module.exports = Comment;
