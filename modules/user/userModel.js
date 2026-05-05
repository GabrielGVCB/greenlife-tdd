const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const User = sequelize.define(
	'User',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		username: {
			type: DataTypes.STRING(30),
			allowNull: false,
			unique: true
		},
		fullName: {
			type: DataTypes.STRING(120),
			allowNull: false
		},
		email: {
			type: DataTypes.STRING(120),
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		// Sempre hash bcrypt — nunca texto plano (R-01)
		password: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		bio: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		profilePicture: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		// "user" ou "admin" — controle de acesso (R-06)
		role: {
			type: DataTypes.ENUM('user', 'admin'),
			allowNull: false,
			defaultValue: 'user'
		}
	},
	{
		tableName: 'users',
		paranoid: true // soft delete via deletedAt
	}
);

module.exports = User;
