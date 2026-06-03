import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Action = sequelize.define(
	'Action',
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		title: { type: DataTypes.STRING(150), allowNull: false },
		description: { type: DataTypes.STRING(500), allowNull: true },
		impactKgCO2: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
		userId: { type: DataTypes.INTEGER, allowNull: false },
		tipId: { type: DataTypes.INTEGER, allowNull: true },
		categoryId: { type: DataTypes.INTEGER, allowNull: true }
	},
	{ tableName: 'actions', paranoid: true }
);

export default Action;
