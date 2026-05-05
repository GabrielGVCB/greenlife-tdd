const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Favorite = dica favoritada por um usuário.
 * UNIQUE(userId, tipId) garante que não há duplicata.
 */
const Favorite = sequelize.define(
	'Favorite',
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
		tipId: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	},
	{
		tableName: 'favorites',
		indexes: [
			{
				unique: true,
				fields: ['userId', 'tipId'],
				name: 'unique_user_tip_favorite'
			}
		]
	}
);

module.exports = Favorite;
