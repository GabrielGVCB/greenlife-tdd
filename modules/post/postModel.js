import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Post = sequelize.define(
	'Post',
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		title: { type: DataTypes.STRING(150), allowNull: false },
		content: { type: DataTypes.TEXT, allowNull: false },
		image: { type: DataTypes.STRING(255), allowNull: true },
		isPrivate: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
		categoryId: { type: DataTypes.INTEGER, allowNull: true },
		userId: { type: DataTypes.INTEGER, allowNull: false }
	},
	{ tableName: 'posts', paranoid: true }
);

export default Post;
