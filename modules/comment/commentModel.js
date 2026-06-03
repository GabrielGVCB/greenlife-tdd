import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Comment = sequelize.define(
	'Comment',
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		text: { type: DataTypes.STRING(500), allowNull: false },
		userId: { type: DataTypes.INTEGER, allowNull: false },
		postId: { type: DataTypes.INTEGER, allowNull: false }
	},
	{ tableName: 'comments', paranoid: true }
);

export default Comment;
