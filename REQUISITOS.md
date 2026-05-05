# 📋 Documento de Requisitos — Green Life

## 1. Identificação

- **Projeto:** Green Life — Plataforma de Sustentabilidade
- **Versão:** 1.0
- **Disciplina:** Teste de Software / Engenharia de Software
- **Data:** 2026

## 2. Visão Geral

O Green Life é uma plataforma web onde usuários podem **aprender sobre práticas sustentáveis**, **registrar ações ecológicas** e **interagir com a comunidade** compartilhando experiências.

O sistema atende dois perfis principais:
- **Usuário comum:** consome conteúdo e publica posts/comentários/ações.
- **Administrador:** gerencia dicas oficiais, categorias e modera a comunidade.

## 3. Escopo

### 3.1. Dentro do escopo
- Cadastro e autenticação de usuários com controle de sessão.
- Gerenciamento de dicas oficiais por categoria.
- Feed público de posts da comunidade com curtidas e comentários.
- Registro pessoal de ações sustentáveis com métrica de impacto.
- Favoritar dicas.
- Painel administrativo com estatísticas e moderação.

### 3.2. Fora do escopo
- Integração com redes sociais externas.
- App mobile nativo (solução é web-first responsiva).
- Sistema de recompensas financeiras/gamificação avançada.
- Notificações push ou e-mail.

---

## 4. Requisitos Funcionais (RF)

### RF-01 — Cadastro de usuário
**Descrição:** O sistema deve permitir o cadastro de novos usuários fornecendo nome completo, nome de usuário, e-mail e senha.
**Regras:** E-mail único, usuário único, senha ≥ 8 caracteres.
**Tela:** `/register`

### RF-02 — Autenticação (Login)
**Descrição:** O usuário deve poder entrar informando e-mail **ou** nome de usuário + senha.
**Regras:** A senha nunca é armazenada em texto plano (bcrypt, 10 rounds). Mensagem genérica de erro para não vazar se o e-mail existe.
**Tela:** `/login`

### RF-03 — Logout
**Descrição:** O usuário deve poder encerrar a sessão.
**Tela:** botão no menu do usuário.

### RF-04 — Edição de perfil
**Descrição:** O usuário pode atualizar nome completo, bio (até 255 chars) e foto de perfil.
**Regras:** Upload apenas de imagens (JPG, PNG, GIF, WEBP) até 4MB.
**Tela:** `/profile/edit`

### RF-05 — Explorar dicas por categoria
**Descrição:** Qualquer visitante autenticado pode navegar pelas categorias e visualizar as dicas oficiais.
**Tela:** `/home`, `/category/:slug`, `/tip/:id`

### RF-06 — Favoritar dica
**Descrição:** Usuário logado pode marcar/desmarcar uma dica como favorita. O mesmo usuário não pode favoritar duas vezes.
**Regra técnica:** UNIQUE(userId, tipId) no banco.
**Tela:** botão em `/tip/:id` e listagens.

### RF-07 — Registrar ação sustentável
**Descrição:** Usuário logado registra ações realizadas com título, categoria, dica relacionada (opcional) e impacto em kg de CO₂ economizados.
**Tela:** `/actions/new`, listagem em `/actions`.

### RF-08 — Visualizar impacto acumulado
**Descrição:** O sistema deve mostrar o total de kg CO₂ economizados e a quantidade de ações registradas pelo usuário.
**Tela:** `/actions`.

### RF-09 — Publicar post na comunidade
**Descrição:** Usuário logado pode criar posts com título, conteúdo (10 a 5.000 caracteres), imagem opcional, categoria opcional e flag "privado".
**Regras:** Posts privados só aparecem para o autor.
**Tela:** `/post/new`.

### RF-10 — Visualizar feed da comunidade
**Descrição:** O feed deve listar posts públicos de todos os usuários + os próprios posts privados do viewer, ordenados por data decrescente.
**Regra de fallback:** Se não houver posts visíveis, exibir dicas oficiais como conteúdo inicial (cold start).
**Tela:** `/community`.

### RF-11 — Comentar em post
**Descrição:** Usuário logado pode comentar em posts. O texto é sempre renderizado com escape HTML (`<%= %>` no EJS) para prevenir XSS.
**Regras:** Máximo 500 caracteres; não permite comentário vazio.

### RF-12 — Curtir/Descurtir post
**Descrição:** Usuário logado alterna "like" em um post. Cada usuário conta apenas 1 like por post mesmo em múltiplos cliques simultâneos.
**Regra técnica:** UNIQUE(userId, postId) + tratamento de erro de concorrência.

### RF-13 — Dashboard administrativo
**Descrição:** Usuários com role `admin` veem estatísticas globais (total de usuários, dicas, posts, comentários, ações, impacto total).
**Tela:** `/admin/dashboard`.

### RF-14 — CRUD de dicas (admin)
**Descrição:** Admins podem criar, editar e excluir dicas oficiais, incluindo upload de imagem.
**Tela:** `/admin/tips`, `/admin/tips/new`, `/admin/tips/:id/edit`.

### RF-15 — CRUD de categorias (admin)
**Descrição:** Admins podem criar, editar e excluir categorias (nome, slug, ícone, cor).
**Tela:** `/admin/categories`.

### RF-16 — Moderação de usuários (admin)
**Descrição:** Admins podem listar usuários, alternar role (user ↔ admin) e excluir contas.
**Regra:** Admin não pode excluir a si mesmo.
**Tela:** `/admin/users`.

### RF-17 — Moderação de posts (admin)
**Descrição:** Admins podem listar e remover qualquer post da comunidade.
**Tela:** `/admin/posts`.

---

## 5. Requisitos Não-Funcionais (RN)

### RN-001 — Armazenamento seguro de senhas
Toda senha deve ser salva como hash **bcrypt** (salt rounds ≥ 10) no campo `password`. **Texto plano nunca é aceito**.
*(Cobre Risco R-01)*

### RN-002 — Validação de entrada em formulários
Formatação de e-mail validada por regex no backend (`isValidEmail`).
Senha mínima de **8 caracteres** no backend (`isValidPassword`).
Nome de usuário: 3 a 30 caracteres alfanuméricos + underscore.
*(Cobre Riscos R-04, R-11)*

### RN-003 — Limites de upload
- Tamanho máximo: **4 MB** por arquivo.
- Tipos aceitos: `image/jpeg`, `image/png`, `image/gif`, `image/webp` (MIME + extensão).
- Erros sempre retornam JSON/flash legível — nunca silêncio.
*(Cobre Riscos R-02, R-10)*

### RN-004 — Sanitização de saída (XSS)
Todo conteúdo gerado por usuários (comentários, posts, dicas) é renderizado exclusivamente com `<%= %>` do EJS (escape automático de HTML). `<%- %>` é proibido para dados de usuário.
*(Cobre Risco R-07)*

### RN-005 — Controle de acesso
Rotas privadas exigem sessão ativa (`middlewares/auth.js`).
Rotas `/admin/*` exigem `role = 'admin'` (`middlewares/adminAuth.js`).
Usuário sem sessão → redirect para `/login` (401).
Usuário sem role → HTTP 403 + página de erro.
*(Cobre Risco R-06)*

### RN-006 — Integridade referencial
Likes e Favoritos possuem **UNIQUE** composto (userId, itemId) no banco. Mesmo que múltiplas requisições cheguem em paralelo, apenas uma é persistida (as demais capturadas em `try/catch` de `SequelizeUniqueConstraintError`).
*(Cobre Risco R-05)*

### RN-007 — Resiliência de banco
Todas as chamadas ao banco em controllers estão envoltas em `try/catch`. Falha de conexão retorna tela de erro amigável (HTTP 500) em vez de crash do processo.
*(Cobre Risco R-03)*

### RN-008 — Privacidade de conteúdo
Posts com `isPrivate = true` são retornados **apenas** se `viewerId === post.userId` (consulta com cláusula OR). Aplica-se à listagem e ao detalhe.
*(Cobre Risco R-12)*

### RN-009 — Feed com fallback
Se o feed da comunidade retornar lista vazia, o sistema deve mostrar dicas oficiais em destaque no lugar — nunca tela em branco (cold start).
*(Cobre Risco R-09)*

### RN-010 — Tamanho do conteúdo
Conteúdo textual de dicas e posts: mínimo **10** e máximo **5.000** caracteres.
Comentários: máximo **500** caracteres.
*(Cobre Risco R-08)*

### RN-011 — Sessão
Cookie de sessão com `maxAge = 24h`. Segredo em `process.env.SESSION_SECRET`.

### RN-012 — Tempo de resposta
Requisições de leitura simples devem responder em menos de 500 ms em ambiente local.

---

## 6. Personas

### 👤 Usuário comum (Maria, 32 anos)
Quer aprender dicas práticas, registrar pequenas ações do dia-a-dia e se inspirar com outras pessoas da comunidade.

### 👤 Administrador (Rafael, 45 anos)
Responsável por curadoria de conteúdo educacional, criação de dicas oficiais e moderação da comunidade.

---

## 7. Fluxos principais

### 7.1. Cadastro + Login + Primeira ação
1. Usuário acessa `/` (landing).
2. Clica em "Criar conta" → `/register`.
3. Preenche formulário → POST `/register` → volta para `/login`.
4. Faz login → POST `/login` → redireciona para `/home`.
5. Clica em categoria → `/category/:slug` → lê dica → clica em "Apliquei essa dica" → `/actions/new`.
6. Preenche formulário → POST `/actions/new` → `/actions`.

### 7.2. Publicação na comunidade
1. Usuário logado acessa `/community`.
2. Clica em "+ Novo Post" → `/post/new`.
3. Publica → redireciona para `/post/:id`.
4. Outros usuários curtem e comentam.

### 7.3. Moderação
1. Admin acessa `/admin/dashboard`.
2. Vê métrica de impacto global.
3. Navega para `/admin/posts` e remove post inadequado.

---

## 8. Telas (mapeamento)

| Rota | Perfil | Tela |
| :--- | :--- | :--- |
| `/` | Público | Landing |
| `/login` | Público | Login |
| `/register` | Público | Cadastro |
| `/home` | Logado | Home com categorias e dicas |
| `/category/:slug` | Logado | Detalhe de categoria |
| `/tip/:id` | Logado | Detalhe de dica |
| `/community` | Público (parcial) | Feed da comunidade |
| `/post/:id` | Público (se post público) | Detalhe do post |
| `/post/new` | Logado | Formulário de post |
| `/actions` | Logado | Lista de ações + impacto |
| `/actions/new` | Logado | Formulário de ação |
| `/favorites` | Logado | Dicas favoritadas |
| `/profile/edit` | Logado | Editar perfil |
| `/admin/dashboard` | Admin | Estatísticas |
| `/admin/users` | Admin | Moderação de usuários |
| `/admin/tips` | Admin | CRUD de dicas |
| `/admin/categories` | Admin | CRUD de categorias |
| `/admin/posts` | Admin | Moderação de posts |
