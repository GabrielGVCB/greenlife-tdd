import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Tip = sequelize.define(
	'Tip',
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		title: { type: DataTypes.STRING(150), allowNull: false },
		content: { type: DataTypes.TEXT, allowNull: false },
		summary: { type: DataTypes.STRING(255), allowNull: true },
		image: { type: DataTypes.STRING(255), allowNull: true },
		readTimeMinutes: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 5 },
		impactKgCO2: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
		categoryId: { type: DataTypes.INTEGER, allowNull: false },
		authorId: { type: DataTypes.INTEGER, allowNull: false }
	},
	{ tableName: 'tips', paranoid: true }
);

export default Tip;
