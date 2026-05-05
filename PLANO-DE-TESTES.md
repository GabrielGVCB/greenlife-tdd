# Plano de Teste — Green Life

## 1. Identificação

- **Projeto:** Green Life — Plataforma de Sustentabilidade
- **Versão:** 1.0
- **Disciplina:** Teste de Software / Engenharia de Software
- **Data:** 2026
- **Objetivo:** Garantir que as funcionalidades de cadastro, autenticação, upload, feed da comunidade e interações (likes/comentários/ações) funcionem conforme os requisitos de negócio e padrões de segurança, detectando falhas precocemente antes da entrega.

## 2. Escopo dos Testes

### 2.1. Em Escopo (O que SERÁ testado)

- Cadastro e login de usuários (validação de campos e autenticação segura).
- Edição de perfil e armazenamento seguro de dados sensíveis (senhas com bcrypt).
- Upload de imagens (perfil, dicas e posts) com verificação de tamanho e formato.
- Funcionalidades do feed da comunidade (visibilidade, privacidade, fallback).
- Interações: curtidas (evitar duplicação), comentários (prevenção de XSS).
- Acessos ao painel administrativo (controle de role).
- Regras de tamanho de conteúdo de dicas/posts.

### 2.2. Fora de Escopo

- Testes de carga, estresse e desempenho em larga escala.
- Testes de compatibilidade em múltiplos dispositivos ou navegadores específicos.
- Integrações com serviços de terceiros.

## 3. Estratégia de Testes

A estratégia é fundamentada em **Shift-Left Testing**, integrando as atividades de teste o mais cedo possível no ciclo de desenvolvimento. A estrutura segue a **Pirâmide de Testes**:

1. **Testes Unitários:** Base da pirâmide, focando na validação de unidades mínimas de código — funções puras de validação (e-mail, senha, conteúdo), hashing de senhas, sanitização de texto e regras de negócio isoladas em cada Service.
2. **Testes de Integração:** Meio da pirâmide, garantindo a comunicação entre módulos. Cobrem rotas de autenticação (`/register`, `/login`), middlewares de upload (multer), proteção de rotas privadas (`/admin`) e interações com o banco via Sequelize.
3. **Testes Black-Box (Sistema/E2E):** Topo da pirâmide, simulando o comportamento do usuário final através de técnicas de análise sistemática.

### Ferramentas utilizadas

- **Vitest** — estruturação e execução de testes automatizados (unitários e integração).
- **Supertest** — simulação de requisições HTTP na API.
- **c8 / @vitest/coverage-v8** — geração de relatórios de cobertura.
- **GitHub Actions** — CI/CD (integração e automação).

## 4. Análise de Riscos e Mitigação

Mapeamos exatamente **12 Riscos Críticos (R-01 a R-12)** para que batam 1:1 com a modelagem **Black-Box** da seção 5 e os casos de teste da seção 6.

| ID | Descrição | Categoria | Prob. | Impacto | Prioridade | Estratégia de Mitigação |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| R-01 | Senha armazenada em texto plano | Segurança | Alta | Crítico | Crítica | Testes de integração na camada `userService.createUser` validando uso de `bcrypt.hash` ANTES de salvar no DB. |
| R-02 | Upload de imagem aceitando `.exe` | Func/Segurança | Alta | Crítico | Crítica | Análise de Particionamento no middleware `multer.js` validando `mimetype` E extensão permitidas (JPG/PNG/GIF/WEBP). |
| R-03 | Banco indisponível derruba a app | Técnico | Média | Alto | Alta | Controllers usam `try/catch` em todas as chamadas ao banco, com render de página 500 amigável. |
| R-04 | E-mail inválido passa no cadastro | Funcional | Alta | Alto | Alta | Testes unitários em `validators.isValidEmail` com regex, retornando HTTP 400 no controller. |
| R-05 | Contador de curtidas duplicando | Funcional | Alta | Médio | Média | UNIQUE constraint `(userId, postId)` na tabela `likes` + captura de `SequelizeUniqueConstraintError` em `likeService.toggle`. |
| R-06 | Rota admin acessível sem login | Segurança | Média | Crítico | Crítica | Middleware `adminAuth.js` aplicado globalmente em `/admin/*`, validando sessão + role. Retornos 401/403. |
| R-07 | Comentário executando script (XSS) | Segurança | Alta | Crítico | Crítica | Render obrigatório com `<%= %>` (escape EJS) + utilitário `sanitizeText` de reforço. |
| R-08 | Conteúdo de dica/post acima do limite | Negócio | Média | Médio | Média | `validators.isValidContent` garante limite de 5.000 caracteres no Service antes do `create`. |
| R-09 | Feed da comunidade vazio (cold start) | Funcional | Baixa | Alto | Média | `postController.community` detecta lista vazia e injeta dicas oficiais como fallback. |
| R-10 | Erro silencioso em upload gigante | Técnico | Alta | Baixo | Baixa | `multer.limits.fileSize = 4MB` + `uploadErrorHandler.js` retornando JSON legível com código de erro. |
| R-11 | Cadastro permite senhas muito curtas | Segurança | Alta | Alto | Alta | `validators.isValidPassword` exige mínimo 8 caracteres antes do `bcrypt.hash`. |
| R-12 | Post privado exposto publicamente | Func/Privacidade | Alta | Crítico | Crítica | `postService.listVisible` aplica cláusula OR: `isPrivate = false` OR `userId = viewerId`. |

### Detalhamento dos Erros (Defeitos Simulados)

#### R-01. Senha não guardada com criptografia
**Como ocorre:** O servidor salva diretamente do `req.body` sem aplicar a biblioteca bcrypt.
```js
// ❌ Falha: senha em texto plano
const newUser = await User.create({ email, password });
```
**Como reproduzir:** Cadastre um usuário com senha "abcdefgh", acesse o MySQL Workbench e inspecione a coluna `password` na tabela `users`.
**Impacto:** Vazamento de base expõe credenciais em texto plano.
**Mitigação implementada:** `userService.createUser` aplica `bcrypt.hash(password, 10)` antes de chamar `User.create`.

#### R-02. Upload aceitando arquivos maliciosos
**Como ocorre:** O middleware multer sem `fileFilter` aceita qualquer arquivo.
```js
// ❌ Falha: sem fileFilter
const upload = multer({ dest: 'uploads/' });
```
**Como reproduzir:** Na tela de editar perfil, selecione um `virus.exe` e envie.
**Mitigação implementada:** `middlewares/multer.js` valida `mimetype` E extensão (whitelist JPG/PNG/GIF/WEBP).

#### R-03. Banco indisponível (crash sem tratamento)
**Como ocorre:** Queries sem `try/catch`, promises rejeitadas derrubam o processo.
**Como reproduzir:** Desligue o MySQL local e dê F5 na `/home`.
**Mitigação implementada:** Todos os controllers envolvem chamadas em `try/catch` e renderizam `error.ejs` em caso de falha.

#### R-04. E-mail inválido cadastrando normalmente
**Como ocorre:** Validação apenas com `!!email`, sem regex.
**Mitigação implementada:** `validators.isValidEmail` aplica regex RFC-simplificada.

#### R-05. Contador de curtidas duplicando (Race Condition)
**Como ocorre:** `SELECT … UPDATE` não atômico com múltiplas requisições simultâneas.
**Mitigação implementada:** Modelo `Like` tem UNIQUE composto + service captura erro e retorna contagem única.

#### R-06. Rota administrativa exposta
**Mitigação implementada:** `router.use(adminAuth)` na primeira linha de `adminRoutes.js` bloqueia qualquer acesso não-autorizado.

#### R-07. Injeção de scripts em comentários
**Como ocorre:** Uso de `<%- %>` (render bruto) em vez de `<%= %>` (escape).
**Mitigação implementada:** Todas as views renderizam conteúdo de usuário com `<%= %>`. Reforço em `validators.sanitizeText`.

#### R-08. Conteúdo acima do limite
**Mitigação implementada:** `validators.isValidContent` (mín. 10, máx. 5000) aplicado em `tipService.create`, `postService.create` e `update`.

#### R-09. Feed Vazio gera Fallback incorreto
**Mitigação implementada:** `postController.community` carrega `fallbackTips` quando `posts.length === 0`.

#### R-10. Erro silencioso em Upload de Imagem gigante
**Mitigação implementada:** `multer.limits.fileSize = 4MB` + `uploadErrorHandler.js` retorna flash/JSON legível.

#### R-11. Cadastro permite senhas muito curtas
**Mitigação implementada:** `validators.isValidPassword` exige `length >= 8`.

#### R-12. Post privado exposto publicamente
**Mitigação implementada:** `postService.listVisible` e `findVisibleById` aplicam `[Op.or]: [{ isPrivate: false }, { userId: viewerId }]`.

---

## 5. Modelagem de Testes (Técnicas Black-Box)

### 5.1. Upload de Imagens — Particionamento de Equivalência e Valor-Limite
**Riscos cobertos:** R-02 (arquivo proibido), R-10 (arquivo gigante)

**Regra:** Arquivo deve ser imagem (JPG, PNG, GIF, WEBP) com até 4MB.

| Campo | Classe Válida | Classes Inválidas |
| :--- | :--- | :--- |
| **Formato** | `.jpg`, `.png`, `.gif`, `.webp` | `.exe`, `.pdf`, `.mp4`, `.txt`, `.avi` |
| **Tamanho** | 1 KB a 4 MB | 0 bytes (vazio); > 4 MB |

**Análise de Valores-Limite (Tamanho):**

| Limite | Valor Mínimo | Abaixo do Mín. | Valor Máximo | Acima do Máx. |
| :--- | :--- | :--- | :--- | :--- |
| **Valores Teste** | 1 KB | 0 bytes | 4 MB | 4,1 MB |

---

### 5.2. Cadastro de Usuário — Particionamento e Valor-Limite
**Riscos cobertos:** R-04 (e-mail inválido), R-11 (senha curta)

**Regra:** E-mail em formato válido + senha com mínimo 8 caracteres.

| Campo | Classe Válida | Classes Inválidas |
| :--- | :--- | :--- |
| **E-mail** | `usuario@dominio.com` | `teste123` (sem @); `@dominio.com` (sem user); `user@` (sem domínio) |
| **Senha** | ≥ 8 chars (ex: `Verde2024`) | `""` (vazia); `123` (3); `1234567` (7) |

**Valor-Limite (Comprimento da Senha):**

| Limite | Abaixo | Mínimo (8) | Acima do Mínimo |
| :--- | :--- | :--- | :--- |
| **Valores Teste** | 7 chars | 8 chars | 9 chars |

---

### 5.3. Interação de Curtidas — Particionamento de Equivalência
**Risco coberto:** R-05 (curtida duplicada / race condition)

**Regra:** Cada usuário registra 1 curtida por post. Novo clique desfaz (toggle).

| Estado Atual | Ação | Resultado Esperado |
| :--- | :--- | :--- |
| Usuário NÃO curtiu | Clicar "Curtir" 1x | Contador +1 |
| Usuário JÁ curtiu | Clicar "Curtir" 1x | Contador −1 (unlike) |
| Usuário NÃO curtiu | 10 requests em paralelo | Contador final = 1 (UNIQUE) |
| Usuário NÃO logado | Clicar "Curtir" | Redirect para `/login` |

---

### 5.4. Controle de Acesso — Tabela de Decisão
**Riscos cobertos:** R-06 (admin exposto), R-01 (auth)

**Regra:** `/admin/*` exige autenticação + role=admin.

| Condições \ Regras | R1 | R2 | R3 | R4 |
| :--- | :--- | :--- | :--- | :--- |
| Está autenticado? | S | S | N | N |
| Possui role "admin"? | S | N | S | N |
| **Permite acesso** | ✅ | ❌ | ❌ | ❌ |
| **Retorno HTTP** | 200 | 403 | 401 | 401 |

---

### 5.5. Sanitização de Comentários (XSS) — Particionamento
**Risco coberto:** R-07 (injeção de script)

**Regra:** Texto é sempre exibido como texto literal, nunca interpretado.

| Tipo de Input | Classe | Resultado Esperado |
| :--- | :--- | :--- |
| `"Ótima dica!"` | Válido | Renderizado normalmente |
| `<b>negrito</b>` | Inválido (potencial) | Exibido como `<b>negrito</b>` literal |
| `<script>alert(1)</script>` | Inválido (ataque) | Exibido como texto, sem execução |
| `<img onerror=alert(1)>` | Inválido (ataque) | Texto literal, evento não dispara |
| `""` | Inválido | Bloqueado pelo form |

---

### 5.6. Visibilidade de Posts — Tabela de Decisão
**Riscos cobertos:** R-09 (fallback), R-12 (privacidade)

**Regra:** Um post aparece se for público OU se o viewer for o autor.

| Condições \ Regras | R1 | R2 | R3 | R4 |
| :--- | :--- | :--- | :--- | :--- |
| Post é público? | S | S | N | N |
| Viewer é o autor? | S | N | S | N |
| **Exibe post** | ✅ | ✅ | ✅ | ❌ |

---

## 6. Casos de Teste Planejados (1:1 com riscos)

| ID | Título (Risco) | Modelagem | Pré-condições | Passos | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CT-01** | Senha sem criptografia (R-01) | 5.4 Tabela | Conta nova "verde_test" | 1. Cadastrar; 2. Inspecionar coluna `password` | Valor é hash bcrypt (`$2b$10$...`), não texto plano |
| **CT-02** | Upload de `.exe` como imagem (R-02) | 5.1 Particionamento | Tela de edição de perfil | 1. Selecionar `script.exe`; 2. Enviar | Erro 400: "Tipo de arquivo não suportado" |
| **CT-03** | Banco indisponível (R-03) | N/A | MySQL parado | 1. Acessar `/home` | Renderiza `error.ejs` (HTTP 500), sem crash |
| **CT-04** | E-mail inválido no cadastro (R-04) | 5.2 Particionamento | `/register` | 1. Digitar `teste123` no campo e-mail; 2. Submit | Flash: "Formato de e-mail inválido" |
| **CT-05** | Curtida duplicada / Race (R-05) | 5.3 Particionamento | Logado, post existe | 1. Enviar 10 POSTs `/post/:id/like` em paralelo | Contador final = 1 |
| **CT-06** | Acesso indevido ao `/admin` (R-06) | 5.4 Tabela | Logado como user comum | 1. Acessar `/admin/dashboard` | HTTP 403 + mensagem "Acesso negado" |
| **CT-07** | XSS em comentário (R-07) | 5.5 Particionamento | Post aberto, logado | 1. Comentar `<script>alert(1)</script>`; 2. Recarregar | Exibido como texto literal, sem alerta |
| **CT-08** | Conteúdo > 5000 chars (R-08) | 5.1 Valor-Limite | Formulário de post/dica | 1. Colar texto de 5.001 chars; 2. Enviar | Flash: "Conteúdo deve ter no máximo 5000 caracteres" |
| **CT-09** | Comunidade vazia para novo user (R-09) | 5.6 Tabela | Banco sem posts | 1. Acessar `/community` | Exibe dicas oficiais como fallback (não tela em branco) |
| **CT-10** | Upload de imagem gigante (R-10) | 5.1 Valor-Limite | Editar perfil | 1. Subir imagem de 5 MB; 2. Enviar | Flash: "Arquivo muito grande. O limite é 4MB" |
| **CT-11** | Senha curta no cadastro (R-11) | 5.2 Valor-Limite | `/register` | 1. Senha `"1234567"` (7 chars); 2. Submit | Flash: "Senha deve ter no mínimo 8 caracteres" |
| **CT-12** | Post privado exposto (R-12) | 5.6 Tabela | User "A" cria post com `isPrivate=true`; User "B" logado | 1. B acessa `/community` ou `/post/:id` | Post de A não aparece / retorna 404 |

---

## 7. Recursos e Ambiente

- **Ambiente de Teste:** Node.js v20+, MySQL 8 local, Vitest + Supertest.
- **Massa de Dados:** Usuários e posts em `tests/fixtures/`; imagens limpas (PNG 100KB) para validar multer.
- **Pipeline / CI:** GitHub Actions roda `npm test` em cada PR.

## 8. Critérios de Aceitação

### 8.1. Critérios de Entrada

- Módulos MVC desenvolvidos e acessíveis localmente (banco limpo + seed via `npm run seed`).
- `npm run dev` sobe sem erros e exibe `🌱 Green Life rodando em http://localhost:3000`.
- Todos os riscos R-01 a R-12 documentados e com mitigação codificada.

### 8.2. Critérios de Saída

- **Cobertura:** `@vitest/coverage-v8` evidenciando **≥ 70%** nas camadas `services/` e `middlewares/`.
- **Segurança:** Zero falhas nos riscos Críticos (R-01, R-02, R-06, R-07, R-12).
- **Validação Empírica:** 100% dos 12 casos de teste passando em verde.

### 8.3. Critérios de Suspensão

- Falha persistente na conexão com MySQL local.
- Falha sistemática no módulo central de router/multer inviabilizando E2E.
