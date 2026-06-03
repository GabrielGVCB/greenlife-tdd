import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Favorite = sequelize.define(
	'Favorite',
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		userId: { type: DataTypes.INTEGER, allowNull: false },
		tipId: { type: DataTypes.INTEGER, allowNull: false }
	},
	{
		tableName: 'favorites',
		indexes: [{ unique: true, fields: ['userId', 'tipId'], name: 'unique_user_tip_favorite' }]
	}
);

export default Favorite;
