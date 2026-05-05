/**
 * Seed de dados iniciais para Green Life.
 *
 * Uso: node scripts/seed.js
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

// Carrega models e associações
require('../modules/user/userModel');
require('../modules/category/categoryModel');
require('../modules/tip/tipModel');
require('../modules/post/postModel');
require('../modules/comment/commentModel');
require('../modules/like/likeModel');
require('../modules/action/actionModel');
require('../modules/favorite/favoriteModel');
const { User, Category, Tip } = require('../modules/associations');

const CATEGORIES = [
	{ name: 'Energia',     slug: 'energia',     description: 'Consumo consciente em casa',             icon: 'bi-lightning-charge', color: '#C48430' },
	{ name: 'Água',        slug: 'agua',        description: 'Economize no dia-a-dia e reuso',         icon: 'bi-droplet',          color: '#2E6A85' },
	{ name: 'Reciclagem',  slug: 'reciclagem',  description: 'Separação correta e compostagem',        icon: 'bi-recycle',          color: '#3E6B4A' },
	{ name: 'Alimentação', slug: 'alimentacao', description: 'Consumo sazonal e zero desperdício',     icon: 'bi-apple',            color: '#7A3F2B' },
	{ name: 'Transporte',  slug: 'transporte',  description: 'Mobilidade ativa e caronas',             icon: 'bi-bicycle',          color: '#4A3E70' },
	{ name: 'Consumo',     slug: 'consumo',     description: 'Compras conscientes e durabilidade',     icon: 'bi-bag',              color: '#5C8F68' }
];

async function run() {
	try {
		await sequelize.authenticate();
		console.log('✅ Banco conectado');

		await sequelize.sync({ alter: true });
		console.log('✅ Banco sincronizado');

		// Admin default
		const adminEmail = 'admin@greenlife.com';
		let admin = await User.findOne({ where: { email: adminEmail } });
		if (!admin) {
			const hash = await bcrypt.hash('admin@123', 10);
			admin = await User.create({
				username: 'admin',
				fullName: 'Administrador Green Life',
				email: adminEmail,
				password: hash,
				role: 'admin'
			});
			console.log('✅ Admin criado: admin@greenlife.com / admin@123');
		} else {
			console.log('ℹ️  Admin já existe, pulando.');
		}

		// Categorias
		for (const cat of CATEGORIES) {
			const [, created] = await Category.findOrCreate({
				where: { slug: cat.slug },
				defaults: cat
			});
			if (created) console.log(`  + Categoria: ${cat.name}`);
		}

		// Dica exemplo
		const energia = await Category.findOne({ where: { slug: 'energia' } });
		if (energia) {
			const exists = await Tip.findOne({ where: { title: 'Troque lâmpadas incandescentes por LED' } });
			if (!exists) {
				await Tip.create({
					title: 'Troque lâmpadas incandescentes por LED',
					summary: 'Economia de até 80% na conta de luz com vida útil 5x maior.',
					content:
						'A troca de lâmpadas antigas por modelos LED reduz o consumo em até 80% com vida útil cinco vezes maior. ' +
						'Em uma residência média de quatro pessoas, a economia anual pode ultrapassar R$ 450 sem nenhuma perda de conforto. ' +
						'Comece pelos cômodos mais usados (sala, cozinha) e avance gradualmente.',
					categoryId: energia.id,
					authorId: admin.id,
					readTimeMinutes: 4,
					impactKgCO2: 2.5
				});
				console.log('  + Dica exemplo criada');
			}
		}

		console.log('\n🌱 Seed concluído com sucesso!');
		process.exit(0);
	} catch (err) {
		console.error('❌ Erro no seed:', err);
		process.exit(1);
	}
}

run();
