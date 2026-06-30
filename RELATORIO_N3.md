# Relatório Técnico — N3: Evolução do Projeto GreenLife com TDD

## 1. Nova Funcionalidade: Registro de Ação Sustentável com Categorização

### Descrição

A funcionalidade de **Registro de Ação Sustentável** permite que os usuários autenticados registrem ações ecológicas realizadas no dia a dia, categorizando-as e mensurando seu impacto ambiental em quilogramas de CO₂ equivalente (KgCO₂). Cada ação pode estar vinculada a uma **categoria** (ex: Resíduos, Energia, Transporte) e opcionalmente a uma **dica sustentável** do sistema.

### Regras de Negócio

1. **Título obrigatório**: Toda ação deve possuir um título com no mínimo 3 caracteres (após trim).
2. **Usuário obrigatório**: Uma ação sempre pertence a um usuário autenticado (userId).
3. **Impacto KgCO₂**: Valor numérico representando a economia de carbono. Se não informado ou inválido, assume o valor `0`.
4. **Descrição opcional**: Texto livre de até 500 caracteres.
5. **Categorização opcional**: A ação pode ser associada a uma categoria existente (categoryId).
6. **Dica vinculada (opcional)**: A ação pode ser vinculada a uma dica sustentável (tipId).
7. **Remoção com permissão**: Somente o dono da ação pode removê-la; ações inexistentes retornam erro.
8. **Listagem por usuário**: As ações são listadas em ordem decrescente de data de criação, com inclusão de dados da categoria e dica associadas.
9. **Métricas**: O sistema calcula o total de impacto em KgCO₂ e a contagem de ações por usuário.

### Camadas Implementadas

| Camada      | Arquivo                        | Responsabilidade                                      |
|-------------|-------------------------------|-------------------------------------------------------|
| **Model**   | `modules/action/actionModel.js`     | Define o schema Sequelize com campos id, title, description, impactKgCO2, userId, tipId, categoryId |
| **Service** | `modules/action/actionService.js`   | Regras de negócio: validação, criação, listagem, cálculo de impacto, contagem e remoção |
| **Controller** | `modules/action/actionController.js` | Orquestra req/res: recebe dados do formulário, chama o service, trata erros e renderiza views |
| **Routes**  | `modules/action/actionRoutes.js`    | Define endpoints HTTP: GET /actions, GET /actions/new, POST /actions/new, POST /actions/:id/delete |

---

## 2. Aplicação do TDD: Ciclo Red-Green-Refactor

### Exemplo 1: Criação de ação com título vazio (Red → Green → Refactor)

#### 🔴 RED — Teste falha (o comportamento ainda não existe)

```javascript
it('rejeita ação com título vazio', async () => {
    const result = await actionService.create({
        title: '',
        userId: 1
    });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/título/i);
    expect(mockCreate).not.toHaveBeenCalled();
});
```

Neste ponto, se o service não tivesse a validação de título, o teste falharia porque `Action.create()` seria chamado diretamente.

#### 🟢 GREEN — Código mínimo para passar o teste

```javascript
async function create(data) {
    const { title, userId } = data;

    if (!title || title.trim().length < 3) {
        return { ok: false, error: 'Título da ação é obrigatório.' };
    }

    const action = await Action.create({ title: title.trim(), userId });
    return { ok: true, action };
}
```

#### 🔵 REFACTOR — Melhorias sem alterar comportamento

Na fase de refactor, extraímos e organizamos os campos opcionais (`description`, `impactKgCO2`, `tipId`, `categoryId`) com valores padrão, tornando a função mais robusta sem alterar os testes existentes.

### Exemplo 2: Remoção de ação sem permissão (Red → Green → Refactor)

#### 🔴 RED

```javascript
it('retorna erro quando usuário não é dono da ação', async () => {
    const mockAction = { id: 1, userId: 2 };
    mockFindByPk.mockResolvedValue(mockAction);

    const result = await actionService.remove(1, 99);

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/permissão/i);
});
```

#### 🟢 GREEN

```javascript
async function remove(id, userId) {
    const a = await Action.findByPk(id);
    if (!a) return { ok: false, error: 'Ação não encontrada.' };
    if (a.userId !== userId) return { ok: false, error: 'Sem permissão.' };
    await a.destroy();
    return { ok: true };
}
```

#### 🔵 REFACTOR

O código já estava enxuto, então o refactor focou em manter consistência de nomes e padrões com as demais funções do service.

---

## 3. Explicação de Testes

### 3.1 Testes Unitários (3 exemplos detalhados)

#### Teste 1: Criação de ação com sucesso

```javascript
it('cria ação sustentável com sucesso quando dados são válidos', async () => {
    const result = await actionService.create({
        title: 'Plantio de árvores',
        description: 'Plantamos 10 árvores no parque',
        impactKgCO2: 50.5,
        userId: 1,
        tipId: 2,
        categoryId: 3
    });

    expect(result.ok).toBe(true);
    expect(result.action).toHaveProperty('id');
    expect(mockCreate).toHaveBeenCalledOnce();
});
```

- **O que verifica**: Que ao fornecer dados válidos, a ação é criada com sucesso e retorna `ok: true`.
- **Mock utilizado**: `mockCreate` (vi.fn()) simula `Action.create()` retornando um objeto com `id: 1` + dados enviados, isolando do banco de dados real.
- **Asserções**: `toBe(true)` para verificar sucesso, `toHaveProperty('id')` para garantir que a ação retornada tem ID, `toHaveBeenCalledOnce()` para confirmar que o model foi chamado uma única vez.

#### Teste 2: Validação de userId obrigatório

```javascript
it('rejeita ação sem userId', async () => {
    const result = await actionService.create({
        title: 'Ação válida',
        userId: null
    });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/usuário/i);
    expect(mockCreate).not.toHaveBeenCalled();
});
```

- **O que verifica**: Que a regra de negócio "userId é obrigatório" é respeitada — sem usuário, a ação não é criada.
- **Mock utilizado**: `mockCreate` — verificamos que ele **NÃO** foi chamado, comprovando que a validação impediu o acesso ao banco.
- **Asserções**: `toBe(false)` para erro, `toMatch(/usuário/i)` para validar mensagem (case-insensitive), `not.toHaveBeenCalled()` para garantir que não chegou no model.

#### Teste 3: Remoção de ação inexistente

```javascript
it('retorna erro quando ação não é encontrada', async () => {
    mockFindByPk.mockResolvedValue(null);

    const result = await actionService.remove(999, 1);

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/não encontrada/i);
});
```

- **O que verifica**: Que ao tentar remover uma ação com ID que não existe no banco, o service retorna erro amigável.
- **Mock utilizado**: `mockFindByPk` retorna `null`, simulando que a ação não foi encontrada no banco.
- **Asserções**: `toBe(false)` para indicar falha, `toMatch(/não encontrada/i)` para validar a mensagem de erro contendo "não encontrada".

### 3.2 Testes de Integração (2 exemplos detalhados)

#### Teste 1: Criação de ação via HTTP com sucesso

```javascript
it('redireciona para /actions após criação bem-sucedida', async () => {
    const agent = await authenticatedAgent();
    mockCreateAction.mockResolvedValue({
        ok: true,
        action: { id: 1, title: 'Plantio de árvores' }
    });

    const res = await agent
        .post('/actions/new')
        .type('form')
        .send({
            title: 'Plantio de árvores',
            description: 'Plantamos 10 árvores',
            impactKgCO2: 50,
            categoryId: 1
        });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/actions');
});
```

- **O que verifica**: Que ao enviar um POST /actions/new com dados válidos e usuário autenticado, o sistema cria a ação e redireciona para a lista de ações (HTTP 302 → /actions).
- **Mock utilizado**: `mockCreateAction` simula o service retornando `{ ok: true }`, e `authenticatedAgent()` cria uma sessão autenticada via Supertest.
- **Asserções**: `toBe(302)` verifica o redirect HTTP, `toBe('/actions')` confirma o destino correto do redirecionamento.

#### Teste 2: Remoção de ação sem permissão via HTTP

```javascript
it('redireciona para /actions com flash de erro quando sem permissão', async () => {
    const agent = await authenticatedAgent();
    mockRemoveAction.mockResolvedValue({
        ok: false,
        error: 'Sem permissão.'
    });

    const res = await agent.post('/actions/5/delete');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/actions');
});
```

- **O que verifica**: Que ao tentar remover uma ação de outro usuário via HTTP, o controller redireciona para /actions com uma mensagem de erro.
- **Mock utilizado**: `mockRemoveAction` retorna `{ ok: false, error: 'Sem permissão.' }`, simulando a rejeição pelo service.
- **Asserções**: `toBe(302)` para confirmar redirecionamento, `toBe('/actions')` para confirmar que volta à lista de ações.

---

## 4. Cobertura de Código

A cobertura foi configurada no `vitest.config.js` para incluir os dois módulos obrigatórios (user + action) e os middlewares. Os resultados alcançados são:

| Módulo            | Stmts   | Branch  | Funcs | Lines   |
|-------------------|---------|---------|-------|---------|
| **modules/action** | 100%    | 100%    | 100%  | 100%    |
| **modules/user**   | 92.74%  | 80.32%  | 100%  | 92.74%  |
| **middlewares**     | 97.61%  | 97.22%  | 100%  | 97.61%  |
| **Total**           | 95.47%  | 89.6%   | 100%  | 95.47%  |

Ambos os módulos atingem **mais de 80%** em todas as métricas, conforme exigido.

O relatório HTML de cobertura está na pasta `coverage/`.

---

## 5. Instruções para Rodar o Projeto

### Pré-requisitos
- Node.js v18+
- MySQL configurado (ou variáveis de ambiente no `.env`)

### Instalação

```bash
npm install
```

### Rodar testes

```bash
npm test
```

### Rodar testes com cobertura

```bash
npm run test:coverage
```

O relatório HTML de cobertura será gerado na pasta `coverage/`.

### Rodar o servidor em desenvolvimento

```bash
npm run dev
```

---

## 6. Estrutura dos Testes

```
tests/
├── setup.js                           # Configuração global (restoreAllMocks)
├── unit/
│   ├── userService.test.js            # 20 testes unitários do módulo user
│   ├── validators.test.js             # 23 testes unitários dos validators
│   └── actionService.test.js          # 16 testes unitários do módulo action
├── integration/
│   ├── userRoutes.test.js             # 9 testes de integração HTTP (user)
│   ├── userController.test.js         # 9 testes de integração HTTP (user controller)
│   ├── actionRoutes.test.js           # 13 testes de integração HTTP (action)
│   ├── adminAuth.test.js              # 4 testes do middleware adminAuth
│   └── health.test.js                 # 1 teste do endpoint /health
└── api/
    └── carbonApi.test.js              # 9 testes da API externa de carbono
```

**Total: 104 testes** (todos passando ✅)
- Testes unitários: 59 (user: 20 + validators: 23 + action: 16)
- Testes de integração: 36 (user routes: 9 + user controller: 9 + action routes: 13 + admin: 4 + health: 1)
- Testes de API: 9
