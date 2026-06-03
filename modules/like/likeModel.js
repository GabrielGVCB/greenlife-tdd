import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Like = sequelize.define(
	'Like',
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		userId: { type: DataTypes.INTEGER, allowNull: false },
		postId: { type: DataTypes.INTEGER, allowNull: false }
	},
	{
		tableName: 'likes',
		indexes: [{ unique: true, fields: ['userId', 'postId'], name: 'unique_user_post_like' }]
	}
);

export default Like;
