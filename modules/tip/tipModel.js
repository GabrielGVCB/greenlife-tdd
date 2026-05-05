const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Tip = Dica oficial educacional, criada por admin.
 * Aparece na "Aprenda práticas sustentáveis" (home).
 */
const Tip = sequelize.define(
	'Tip',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		title: {
			type: DataTypes.STRING(150),
			allowNull: false
		},
		// Conteúdo principal — limite validado em validators.isValidContent (R-08)
		content: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		summary: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		image: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		readTimeMinutes: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 5
		},
		// Estimativa de impacto se a dica for aplicada (kg CO2/uso)
		impactKgCO2: {
			type: DataTypes.FLOAT,
			allowNull: true,
			defaultValue: 0
		},
		categoryId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		authorId: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	},
	{
		tableName: 'tips',
		paranoid: true
	}
);

module.exports = Tip;
