import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Category = sequelize.define(
	'Category',
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		name: { type: DataTypes.STRING(60), allowNull: false, unique: true },
		slug: { type: DataTypes.STRING(80), allowNull: false, unique: true },
		description: { type: DataTypes.STRING(255), allowNull: true },
		icon: { type: DataTypes.STRING(60), allowNull: true, defaultValue: 'bi-leaf' },
		color: { type: DataTypes.STRING(20), allowNull: true, defaultValue: '#3E6B4A' }
	},
	{ tableName: 'categories', paranoid: true }
);

export default Category;
