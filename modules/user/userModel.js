import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const User = sequelize.define(
	'User',
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		username: { type: DataTypes.STRING(30), allowNull: false, unique: true },
		fullName: { type: DataTypes.STRING(120), allowNull: false },
		email: {
			type: DataTypes.STRING(120),
			allowNull: false,
			unique: true,
			validate: { isEmail: true }
		},
		password: { type: DataTypes.STRING(255), allowNull: false },
		bio: { type: DataTypes.STRING(255), allowNull: true },
		profilePicture: { type: DataTypes.STRING(255), allowNull: true },
		role: {
			type: DataTypes.ENUM('user', 'admin'),
			allowNull: false,
			defaultValue: 'user'
		}
	},
	{ tableName: 'users', paranoid: true }
);

export default User;
