-- =============================================================
-- Green Life - Script de inicialização do banco
-- =============================================================
-- Execução:
--   mysql -u root -p < scripts/database_start.sql
-- =============================================================

DROP DATABASE IF EXISTS greenlife_db;
CREATE DATABASE greenlife_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE greenlife_db;

-- Obs.: as tabelas são criadas automaticamente pelo Sequelize via sync()
-- quando o app sobe pela primeira vez. Os INSERTs de seed abaixo ficam
-- comentados e podem ser executados MANUALMENTE após o primeiro
-- `npm run dev`, ou rodando `node scripts/seed.js`.

-- =============================================================
-- SEEDS (executar DEPOIS do primeiro npm run dev)
-- =============================================================

-- Senha "admin@123" já hashada com bcrypt (10 rounds)
-- Gere uma nova em https://bcrypt-generator.com/ se preferir.
-- Aqui: $2b$10$K8y5D2qZ4Y3.5xJ0c3L8tOWJXVx6H3jYzKvDfY3qDHZvSgA7e/JXa

/*
INSERT INTO users (username, fullName, email, password, role, createdAt, updatedAt)
VALUES (
    'admin',
    'Administrador',
    'admin@greenlife.com',
    '$2b$10$K8y5D2qZ4Y3.5xJ0c3L8tOWJXVx6H3jYzKvDfY3qDHZvSgA7e/JXa',
    'admin',
    NOW(), NOW()
);

INSERT INTO categories (name, slug, description, icon, color, createdAt, updatedAt) VALUES
    ('Energia',      'energia',      'Consumo consciente em casa e no trabalho',     'bi-lightning-charge', '#C48430', NOW(), NOW()),
    ('Água',         'agua',         'Economize no dia-a-dia e reuso',               'bi-droplet',          '#2E6A85', NOW(), NOW()),
    ('Reciclagem',   'reciclagem',   'Separação correta e compostagem',              'bi-recycle',          '#3E6B4A', NOW(), NOW()),
    ('Alimentação',  'alimentacao',  'Consumo sazonal e zero desperdício',           'bi-apple',            '#7A3F2B', NOW(), NOW()),
    ('Transporte',   'transporte',   'Mobilidade ativa e caronas compartilhadas',    'bi-bicycle',          '#4A3E70', NOW(), NOW()),
    ('Consumo',      'consumo',      'Compras conscientes e durabilidade',           'bi-bag',              '#5C8F68', NOW(), NOW());
*/