const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Action = ação sustentável registrada por um usuário.
 * Permite acompanhar o impacto pessoal acumulado.
 *
 * Ex: "Apliquei a dica de trocar lâmpadas por LED"
 *     → impactKgCO2 = 2.5 kg evitados
 */
const Action = sequelize.define(
	'Action',
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
		description: {
			type: DataTypes.STRING(500),
			allowNull: true
		},
		impactKgCO2: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		// Relacionada (opcionalmente) com a dica que inspirou
		tipId: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		categoryId: {
			type: DataTypes.INTEGER,
			allowNull: true
		}
	},
	{
		tableName: 'actions',
		paranoid: true
	}
);

module.exports = Action;
