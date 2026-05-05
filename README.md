# 🌱 Green Life — Plataforma de Sustentabilidade

Plataforma onde usuários podem **aprender sobre práticas sustentáveis**, **registrar ações ecológicas** e **interagir com a comunidade**.

Projeto desenvolvido para a disciplina **Teste de Software / Engenharia de Software**.

---

## 🛠 Stack

- **Node.js** + **Express 4**
- **EJS** (express-ejs-layouts) — SSR
- **MySQL** + **Sequelize** (ORM)
- **express-session** + **connect-flash** (autenticação)
- **bcrypt** (hash de senha)
- **Multer** (upload de imagens)
- **Bootstrap 5** + Bootstrap Icons (CDN)
- **Vitest** + **Supertest** + **c8** (testes)

---

## 📁 Arquitetura

```
greenlife/
├── bin/www                      ← entry-point HTTP
├── app.js                       ← bootstrap do Express
├── config/database.js           ← conexão Sequelize
├── middlewares/
│   ├── auth.js                  ← protege rotas privadas (sessão)
│   ├── adminAuth.js             ← protege rotas /admin (role)
│   └── multer.js                ← upload (4MB, imagens MP4/MOV/JPG/PNG)
├── modules/                     ← MVC modular (Model/Routes/Controller/Service)
│   ├── user/
│   ├── category/
│   ├── tip/                     ← dicas oficiais (admin)
│   ├── post/                    ← posts da comunidade (user)
│   ├── comment/
│   ├── like/
│   ├── action/                  ← ações sustentáveis registradas
│   ├── favorite/
│   └── admin/                   ← dashboard administrativo
├── routes/index.js              ← landing
├── views/
│   ├── layouts/main.ejs
│   ├── pages/                   ← landing, login, register, home, category, community, post-detail, edit-profile, admin/*
│   └── partials/                ← head, navbar, sidebar, footer, messages
├── public/
│   ├── stylesheets/style.css
│   └── uploads/
└── tests/
    ├── unit/
    ├── integration/
    └── fixtures/
```

---

## 🚀 Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Criar banco MySQL
mysql -u root -p < scripts/database_start.sql

# 3. Criar .env (copie do .env.example)
cp .env.example .env

# 4. Rodar em dev
npm run dev

# 5. Rodar testes
npm test
npm run test:coverage
```

Acesse `http://localhost:3000`

---

## 🧪 Testes

Veja o **[PLANO-DE-TESTES.md](./PLANO-DE-TESTES.md)** com:
- 12 Riscos catalogados (R-01 a R-12)
- 12 Casos de Teste 1:1 (CT-01 a CT-12)
- Modelagem Black-Box (Particionamento, Valor-Limite, Tabela de Decisão)
- Critérios de aceitação (cobertura ≥ 70%)

---

## 📄 Requisitos

Veja o **[REQUISITOS.md](./REQUISITOS.md)** com requisitos funcionais (RF) e não-funcionais (RN).
