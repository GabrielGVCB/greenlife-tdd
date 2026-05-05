const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Like = curtida de um usuário em um post.
 *
 * Cobre Risco R-05 (curtida duplicada / race condition):
 *  - UNIQUE constraint composta (userId, postId) garante 1 like por par
 *  - Mesmo se o front enviar 10 requests em paralelo, o BD só aceita 1
 */
const Like = sequelize.define(
	'Like',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
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
		tableName: 'likes',
		// Constraint anti race-condition (R-05)
		indexes: [
			{
				unique: true,
				fields: ['userId', 'postId'],
				name: 'unique_user_post_like'
			}
		]
	}
);

module.exports = Like;
