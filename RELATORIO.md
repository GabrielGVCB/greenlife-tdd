# Relatório TDD — GreenLife

## Vídeo Explicativo
🎥 **Link:** https://youtu.be/SvQYmdgLlKs

---


## 1. Funcionalidade Escolhida: Cadastro de Usuário

### Descrição
A funcionalidade de **cadastro de usuário** (`userService.createUser`) é o ponto de entrada de todos os usuários na plataforma. Ela recebe os dados do formulário de registro e, antes de persistir, executa validações de negócio e garante a segurança das credenciais.

### Regras de Negócio
| Regra | Descrição |
|-------|-----------|
| R-01 | A senha **nunca** é salva em texto plano — sempre como hash bcryptjs |
| R-04 | O e-mail deve ter formato válido (contém `@` e domínio) |
| R-11 | A senha deve ter no mínimo **8 caracteres** |
| Username | Entre 3 e 30 caracteres, somente letras, números e `_` |
| Unicidade | E-mail e username não podem ser duplicados no banco |

---

## 2. Aplicação do TDD — Ciclo Red-Green-Refactor

### Red (Vermelho)
Antes de escrever qualquer código de produção, os testes foram escritos com as expectativas do comportamento desejado. Por exemplo:

```js
it('[R-01] NUNCA salva senha em texto plano', async () => {
  const result = await userService.createUser({ ..., password: 'senhaSegura123' });
  expect(result.ok).toBe(true);
  const createdData = mockCreate.mock.calls[0][0];
  expect(createdData.password).not.toBe('senhaSegura123');
  expect(createdData.password).toMatch(/^\$2[aby]\$/);
});
```
Neste momento o teste falha (Red) pois `createUser` ainda não existia.

### Green (Verde)
A função `createUser` foi implementada com o mínimo necessário para fazer o teste passar: validação de e-mail, senha, username e chamada a `bcryptjs.hash()` antes de `User.create()`.

### Refactor (Refatoração)
Após os testes passarem, o código foi reorganizado:
- As validações foram extraídas para `middlewares/validators.js`, tornando-as reutilizáveis e testáveis de forma independente.
- A função `toSessionUser` foi adicionada para sanitizar o objeto de usuário antes de armazená-lo na sessão (remove o campo `password`).

---

## 3. Exemplos de Testes Unitários

### Teste 1 — [R-01] Senha nunca salva em texto plano
**Arquivo:** `tests/unit/userService.test.js`

```js
it('[R-01] NUNCA salva senha em texto plano', async () => {
  const result = await userService.createUser({
    username: 'maria',
    fullName: 'Maria Silva',
    email: 'maria@greenlife.com',
    password: 'senhaSegura123'
  });
  expect(result.ok).toBe(true);
  const createdData = mockCreate.mock.calls[0][0];
  expect(createdData.password).not.toBe('senhaSegura123');
  expect(createdData.password).toMatch(/^\$2[aby]\$/);
});
```
**O que verifica:** Que a senha passada pelo usuário (`'senhaSegura123'`) nunca é gravada diretamente no banco. O dado salvo deve começar com `$2a$`, `$2b$` ou `$2y$` — padrão de hash bcrypt. Protege o Risco R-01 (vazamento de senhas em texto plano).

---

### Teste 2 — [R-04] Rejeição de e-mail inválido
**Arquivo:** `tests/unit/userService.test.js`

```js
it('[R-04] rejeita e-mail sem @', async () => {
  const result = await userService.createUser({
    username: 'testuser',
    fullName: 'Test User',
    email: 'emailInvalido',
    password: 'abcdefgh'
  });
  expect(result.ok).toBe(false);
  expect(result.error).toMatch(/e-mail/i);
  expect(mockCreate).not.toHaveBeenCalled();
});
```
**O que verifica:** Que o serviço rejeita imediatamente um e-mail sem `@`, retornando `{ ok: false }` com mensagem de erro, e que **nenhuma** operação de banco de dados é realizada (o mock `create` não foi chamado). Protege o Risco R-04.

---

### Teste 3 — [R-11] Análise de valor-limite para senha (8 caracteres)
**Arquivo:** `tests/unit/userService.test.js`

```js
it('[R-11] aceita senha com exatamente 8 caracteres', async () => {
  const result = await userService.createUser({
    username: 'testuser',
    fullName: 'Test User',
    email: 'test@example.com',
    password: '12345678'
  });
  expect(result.ok).toBe(true);
});
```
**O que verifica:** Técnica de **Análise de Valor-Limite** — testa exatamente o valor no limite inferior (8 caracteres). O teste com 7 caracteres deve falhar, e o com 8 deve passar. Protege o Risco R-11 (senha curta).

---

## 4. Refatorações Realizadas Durante o Ciclo TDD

### Refatoração 1 — Extração de validações para `validators.js`

**Antes:**
As validações de e-mail, senha e username estavam embutidas diretamente dentro de `createUser()`, misturando responsabilidades e tornando o código difícil de reaproveitar:

```js
// ANTES — validação inline em userService.js
async function createUser({ username, email, password }) {
  if (!email || !email.includes('@') || email.split('@')[1].length === 0) {
    return { ok: false, error: 'E-mail inválido.' };
  }
  if (!password || password.length < 8) {
    return { ok: false, error: 'Senha deve ter no mínimo 8 caracteres.' };
  }
  if (!username || !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return { ok: false, error: 'Nome de usuário inválido.' };
  }
  // ...resto da função
}
```

**Depois:**
As validações foram extraídas para `middlewares/validators.js` como funções puras, exportadas individualmente e cobertas por seus próprios testes unitários:

```js
// DEPOIS — validators.js com funções puras reutilizáveis
export function isValidEmail(email) {
  if (!email) return { valid: false, message: 'E-mail inválido.' };
  const [user, domain] = String(email).split('@');
  if (!user || !domain) return { valid: false, message: 'E-mail inválido.' };
  return { valid: true };
}

// Em userService.js — limpo e delegado
const emailCheck = isValidEmail(email);
if (!emailCheck.valid) return { ok: false, error: emailCheck.message };
```

**Benefício:** As funções de validação passaram a ser reutilizáveis em qualquer parte do sistema (outros services, middlewares) e ganharam 23 testes unitários independentes em `tests/unit/validators.test.js`, aumentando a confiança no comportamento dos limites sem depender do contexto de `createUser`.

---

### Refatoração 2 — Migração de CJS para ESM e correção do isolamento de mocks

**Antes:**
O projeto usava CommonJS (`require` / `module.exports`). O Vitest opera sobre o sistema de módulos ESM nativo e mantém um cache separado do cache CJS do Node.js. Por isso, `vi.mock()` interceptava os imports do arquivo de teste mas **não** interceptava os `require()` dentro dos services — os mocks não funcionavam:

```js
// ANTES — CJS em userService.js
const User = require('./userModel');
const bcrypt = require('bcrypt');
module.exports = { createUser };

// ANTES — teste falhava silenciosamente: User.create real era chamado
vi.mock('../../modules/user/userModel.js', () => ({ ... }));
// ↑ interceptava o ESM import do teste, mas NÃO o require() do service
```

**Depois:**
Após migrar todo o projeto para ESM (`"type": "module"` no `package.json` e todos os arquivos convertidos para `import/export`), o Vitest passou a interceptar corretamente os módulos em ambos os lados:

```js
// DEPOIS — ESM em userService.js
import User from './userModel.js';
import bcrypt from 'bcryptjs';
export { createUser };

// DEPOIS — vi.mock intercepta corretamente o import do service
vi.mock('../../modules/user/userModel.js', () => ({
  default: { findOne: mockFindOne, create: mockCreate }
}));
```

**Benefício:** Os testes passaram a isolar completamente o banco de dados. O teste de e-mail duplicado, que antes chamava o banco real e falhava de forma não-determinística, passou a funcionar 100% de forma previsível. Além disso, a troca de `bcrypt` para `bcryptjs` (exigida pela especificação) tornou-se trivial com ESM.

---

## 5. Uso de Mocks para Isolamento

O `userModel.js` (Sequelize) é mockado com `vi.mock()`:

```js
const mockFindOne = vi.fn();
const mockCreate = vi.fn();

vi.mock('../../modules/user/userModel.js', () => ({
  default: { findOne: mockFindOne, create: mockCreate }
}));
```

Isso garante que os testes **não dependem de banco de dados**, são rápidos e determinísticos. O comportamento do banco é simulado via `mockResolvedValue` e `mockImplementation` no `beforeEach`.
