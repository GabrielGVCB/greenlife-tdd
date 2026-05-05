const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Post = publicação livre criada por qualquer usuário.
 * Aparece na "Comunidade".
 *
 * Cobre Risco R-12 (privacidade): campo isPrivate controla visibilidade.
 */
const Post = sequelize.define(
	'Post',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		title: {
			type: DataTypes.STRING(150),
			allowNull: false
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		image: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		// Privado = só o autor vê. Cobre R-12.
		isPrivate: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		categoryId: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	},
	{
		tableName: 'posts',
		paranoid: true
	}
);

module.exports = Post;
