Você é um assistente de desenvolvimento full-stack responsável por criar o MVP de um SaaS chamado **CleanTeams**, voltado para agências de diaristas que operam em Nova York.

## Objetivo do produto

Construir uma plataforma SaaS **multilíngue**, **responsiva**, **multi-tenant** e com dois níveis de administração:

1. **Administração do SaaS (SuperAdmin)**:
   - Gerir empresas (tenants), usuários e planos.
   - Visualizar métricas de uso do sistema (quantidade de empresas ativas, jobs criados, diaristas cadastradas, etc).
   - Ter uma visão geral do desempenho do SaaS.

2. **Administração por empresa (Owner/Admin)**:
   - Organizar a **agenda de limpezas** (escala de equipes em duplas/trios, sempre com uma diarista “drive” – motorista).
   - Cadastrar diaristas (cleaners) e clientes (casas).
   - Acompanhar status das limpezas (agendada, em andamento, concluída).
   - Receber informações diretamente das diaristas (sem “telefone sem fio”).

Além disso:

3. **Área da diarista (Cleaner)**:
   - Acessa sua área pelo celular (mobile-first).
   - Vê sua agenda de serviços.
   - Confirma início e término das limpezas.
   - Registra um pequeno relatório do serviço.

Este é um **MVP enxuto**, sem uso de IA por enquanto. Posteriormente o produto poderá ser expandido com novos módulos (financeiro, IA, rotas, etc).

---

## Stack técnica obrigatória

- **Frontend**:
  - React + Vite + TypeScript
  - Tailwind CSS para estilização
  - SPA (single page application) com rotas (React Router ou similar)
  - Deploy na **Vercel**

- **Backend / Banco**:
  - **Supabase**:
    - PostgreSQL
    - Auth (e-mail/senha)
    - RLS para multi-tenant
    - Tabelas e views necessárias para o app

- **Pagamentos / Assinatura**:
  - **Stripe** (Stripe Billing)
  - Planos mensais com **teste grátis de 30 dias**

- **Outros requisitos gerais**:
  - Código organizado e tipado (TypeScript)
  - Arquitetura simples mas escalável
  - Uso de variáveis de ambiente (.env) para chaves de Supabase, Stripe, etc.

---

## Perfis de usuário (roles)

O sistema deve suportar claramente três níveis de usuário:

1. **SuperAdmin (SaaS Admin)**:
   - Responsável pelo SaaS como um todo.
   - Não pertence a nenhuma empresa específica.
   - Pode:
     - visualizar lista de empresas (tenants)
     - ver status de assinaturas (Stripe)
     - ver métricas agregadas (número de empresas, usuários, limpezas agendadas/concluídas)
     - opcionalmente bloquear/reativar empresas
   - Acesso a um painel separado, com rota própria (ex.: `/admin/saas`).

2. **Owner / Admin de Empresa (Company Owner/Admin)**:
   - Pertence a uma `company`.
   - Pode:
     - gerenciar diaristas (cleaners)
     - gerenciar clientes
     - montar agenda de limpezas (schedules)
     - acompanhar status dos serviços
   - Acessa o **Painel Administrativo da Empresa**.

3. **Cleaner (Diarista)**:
   - Pertence a uma empresa.
   - Usa o sistema principalmente pelo celular.
   - Pode:
     - ver sua agenda (dia/semana)
     - marcar início e final da limpeza
     - registrar um pequeno relatório do serviço (issues, extras, observações)
   - Acessa o **Painel da Diarista**, interface mobile-first.

---

## Requisito crítico: Multilíngue (PT / ES / EN)

A plataforma deve ser **totalmente multilíngue desde o MVP**:

- Idiomas suportados:
  - **Português (pt-BR)**
  - **Espanhol (es)**
  - **Inglês (en)**

- Implementar internacionalização usando:
  - Arquivos de traduções (por exemplo JSON por idioma).
  - Todas as labels, títulos, textos de botões e mensagens de validação devem usar o sistema de i18n (sem strings fixas no código).

- **Seletor de idioma obrigatório no Header**:
  - Deve aparecer em todas as telas logadas e públicas.
  - No header, incluir um seletor visível, por exemplo:
    - EN | PT | ES (como botões ou dropdown).
  - Ao mudar o idioma, toda a UI deve ser atualizada.
  - Salvar escolha de idioma:
    - no `localStorage`
    - e, se o usuário estiver autenticado, associar também à sua `profile.language` no banco (quando possível).

- Comportamento sugerido:
  - Na primeira visita, tentar detectar o idioma do navegador.
  - Se não for possível, usar **EN** como padrão.
  - Sempre permitir troca manual via seletor no header.

A **área da diarista** deve ser extremamente simples e amigável em qualquer idioma.

---

## Requisito crítico: Responsividade e mobile-first

- Toda a interface deve ser **responsiva**, usando Tailwind.
- A **área da diarista (Cleaner)** deve ser **pensada primeiro para mobile**:
  - Layout limpo, com poucos cliques.
  - Botões grandes.
  - Tipografia legível.
  - Nada de tabelas horizontais complexas: preferir cards e listas.

- O painel administrativo da empresa e o painel SuperAdmin podem ser mais orientados a desktop, mas ainda responsivos (funcionais em tablets e celulares).

---

## Funcionalidades do MVP – visão por área

### 1. Administração do SaaS (SuperAdmin)

Criar um painel exclusivo para usuários com role `superadmin`:

#### 1.1 Autenticação do SuperAdmin
- Pode ser gerenciado via tabela `profiles` com `role = 'superadmin'` e `company_id = null`.
- SuperAdmin não deve ser afetado por RLS baseado em `company_id`.

#### 1.2 Painel de visão geral do SaaS

Mínimo para MVP:

- Lista de empresas (`companies`):
  - nome
  - data de criação
  - status da assinatura (trial, ativa, cancelada, trial_expired)
  - quantidade aproximada de:
    - diaristas (cleaners)
    - clientes
    - jobs/schedules registrados

- Métricas simples:
  - Número total de empresas cadastradas.
  - Número de empresas ativas (assinatura ok).
  - Número de empresas em trial.
  - Número total de `schedules` criados no sistema.

- Ações básicas:
  - Ver detalhes de uma empresa.
  - (Opcional no MVP) Marcar empresa como bloqueada (campo `is_blocked` em `companies`), impedindo login de usuários daquela empresa.

Não é necessário painel ultra-elaborado. O objetivo é ter uma **visão mínima de saúde do SaaS**.

---

### 2. Administração da Empresa (Owner/Admin)

#### 2.1 Autenticação e multi-tenant

- Usuário se cadastra como Owner:
  - Cria uma `company`.
  - Passa a ter `role = 'owner'` e `company_id` preenchido.
- Outros usuários administrativos (Admin/Manager) podem ser adicionados depois (MVP pode manter todos como Owner/Admin no mesmo nível).

- Usar Supabase Auth para login e signup.
- Aplicar **RLS** nas tabelas para filtrar por `company_id`.

#### 2.2 Integração com Stripe (SaaS + trial de 30 dias)

- Ao criar uma empresa:
  - Criar um `customer` no Stripe (`stripe_customer_id`).
  - Iniciar uma assinatura (`stripe_subscription_id`) com **trial de 30 dias**.
  - Guardar em `companies`:
    - `stripe_customer_id`
    - `stripe_subscription_id`
    - `subscription_status`
    - `trial_ends_at`

- MVP pode ter apenas um plano padrão, desde que:
  - exista trial de 30 dias
  - seja possível verificar se a assinatura está ativa ou não

- Lógica básica:
  - Se `subscription_status` ou `trial_ends_at` indicarem que a empresa está sem assinatura válida, bloquear acesso às funcionalidades principais e exibir uma tela informativa.

#### 2.3 Cadastro de diaristas (Cleaners)

Campos básicos da tabela `cleaners`:

- `id`
- `company_id`
- `name`
- `email` (opcional)
- `phone`
- `language` (enum/string: 'en', 'pt', 'es')
- `drives` (boolean – se é “drive” ou não)
- `status` (ex.: 'active' | 'inactive')
- `area` (bairro/região)
- `created_at`

Funcionalidades:

- Listar diaristas.
- Criar/editar/desativar diaristas.
- Filtros por status, idioma, se é drive.

#### 2.4 Cadastro de clientes

Tabela `clients`:

- `id`
- `company_id`
- `name`
- `address`
- `frequency` (ex.: 'weekly', 'bi-weekly', 'monthly', 'one-time')
- `notes`
- `created_at`

Funcionalidades:

- Listar clientes.
- Criar/editar/inativar clientes.

#### 2.5 Agenda / Escala de Limpezas

Tabela `schedules` (ou `jobs`):

- `id`
- `company_id`
- `client_id`
- `date` (data da limpeza)
- `start_time` (hora aproximada)
- `drive_id` (FK para `cleaners` – precisa ter `drives = true`)
- `helper1_id` (FK `cleaners`)
- `helper2_id` (FK `cleaners`, opcional)
- `status` (ex.: 'scheduled', 'in_progress', 'completed', 'cancelled')
- `created_at`

Regras básicas:

- `drive_id` obrigatório.
- `helper1_id` obrigatório; `helper2_id` opcional.
- Checagem mínima de conflitos:
  - Ao salvar um schedule, verificar se algum dos cleaners já está atribuído a outro job no mesmo dia/horário.

Interface mínima:

- Uma visualização de agenda (pode ser lista por dia ou semana).
- Filtros por data, cliente e cleaner.
- Formulário para criar/editar schedules.

---

### 3. Área da Diarista (Cleaner) – Mobile-first

A diarista faz login e é redirecionada para um painel simplificado, com UI adaptada para celular:

#### 3.1 Minha Agenda

- Lista de serviços (jobs) de hoje + próximos dias.
- Cada item mostra:
  - nome da cliente
  - endereço
  - horário
  - se ela é drive ou helper
  - status (scheduled, in_progress, completed)

- Para cada job:
  - **Botão “Iniciar”**:
    - Marca job como `in_progress` para aquela diarista (no mínimo).
    - Pode registrar `start_time` na tabela `reports`.
  - **Botão “Concluir”**:
    - Abre formulário de relatório rápido.
    - Registra `end_time` e calcula duração.

#### 3.2 Relatório da diarista

Tabela `reports`:

- `id`
- `schedule_id`
- `cleaner_id`
- `start_time` (timestamp)
- `end_time` (timestamp)
- `duration_minutes` (integer)
- `issues` (texto: problemas, atrasos, cliente ausente)
- `extra_tasks` (texto: tarefas extras pedidas)
- `notes` (texto geral)
- `created_at`

Fluxo:

1. Ao clicar “Iniciar”, registrar `start_time` (timestamp atual).
2. Ao clicar “Concluir”, registrar `end_time`, calcular `duration_minutes`.
3. Mostrar um formulário com poucos campos:
   - `issues` (textarea)
   - `extra_tasks` (textarea)
   - `notes` (textarea simples)

A UI deve ser extremamente simples, com botões grandes e textos no idioma configurado para a diarista.

---

## Banco de dados – estrutura sugerida (Supabase)

Tabelas mínimas:

- `companies`
  - id (uuid)
  - name (text)
  - stripe_customer_id (text)
  - stripe_subscription_id (text)
  - subscription_status (text)
  - trial_ends_at (timestamp)
  - is_blocked (boolean, default false)
  - created_at (timestamp)

- `profiles` (usuários ligados ao auth do Supabase)
  - id (uuid – igual ao auth.user.id)
  - company_id (uuid, nullable – será null para superadmin)
  - role (text: 'superadmin' | 'owner' | 'admin' | 'cleaner')
  - name (text)
  - email (text) – manter em sincronia com auth
  - language (text: 'en' | 'pt' | 'es')
  - created_at (timestamp)

- `cleaners`
  - id (uuid)
  - company_id (uuid)
  - name (text)
  - email (text)
  - phone (text)
  - language (text)
  - drives (boolean)
  - status (text: 'active' | 'inactive')
  - area (text)
  - created_at (timestamp)

- `clients`
  - id (uuid)
  - company_id (uuid)
  - name (text)
  - address (text)
  - frequency (text)
  - notes (text)
  - created_at (timestamp)

- `schedules`
  - id (uuid)
  - company_id (uuid)
  - client_id (uuid)
  - date (date)
  - start_time (time or timestamp)
  - drive_id (uuid - FK cleaners)
  - helper1_id (uuid - FK cleaners)
  - helper2_id (uuid - FK cleaners, nullable)
  - status (text: 'scheduled' | 'in_progress' | 'completed' | 'cancelled')
  - created_at (timestamp)

- `reports`
  - id (uuid)
  - schedule_id (uuid)
  - cleaner_id (uuid)
  - start_time (timestamp)
  - end_time (timestamp)
  - duration_minutes (integer)
  - issues (text)
  - extra_tasks (text)
  - notes (text)
  - created_at (timestamp)

Aplicar **RLS**:

- `superadmin`:
  - pode ler tudo (sem filtro de `company_id`).
- Outros usuários:
  - só podem acessar registros com `company_id = profiles.company_id`.
- Cleaners:
  - só podem acessar schedules e reports relacionados à sua empresa e a si próprios quando fizer sentido.

---

## UI / Páginas principais

Criar ao menos:

1. **Landing page pública**:
   - Explicação breve do produto.
   - Benefícios para agências de diaristas em NY.
   - Call-to-action: “Start 30-day free trial”.
   - Header com seletor de idioma (EN/PT/ES).

2. **Páginas de autenticação**:
   - Login.
   - Signup para Owner (cria nova empresa + usuário owner).
   - Recuperação de senha (fluxo do Supabase).

3. **Painel de Empresa (Owner/Admin)**:
   - Dashboard simples:
     - contagem de diaristas
     - contagem de clientes
     - número de jobs da semana
   - CRUD de diaristas (cleaners).
   - CRUD de clientes.
   - Tela de agenda (schedules).

4. **Painel da Diarista (Cleaner)**:
   - “Minha Agenda” (mobile-first).
   - Detalhes do job.
   - Botões “Iniciar” e “Concluir”.
   - Formulário de reporte rápido.

5. **Painel do SuperAdmin (SaaS Admin)**:
   - Lista de empresas com:
     - nome
     - data de criação
     - status da assinatura
     - número de cleaners, clients e schedules.
   - Visualização de métricas globais simples (contadores no topo).
   - (Opcional) Detalhe da empresa e campo `is_blocked`.

Em todas as áreas logadas, manter um header com:

- logo/nome
- seletor de idioma
- informações básicas do usuário
- logout

---

## Como quero que você trabalhe

1. Primeiro, crie a **estrutura inicial do projeto**:
   - React + Vite + TypeScript.
   - Tailwind configurado.
   - Cliente do Supabase configurado.
   - Estrutura de rotas:
     - rotas públicas (landing, login, signup)
     - rotas de empresa (painel owner/admin)
     - rotas de diarista
     - rota de SuperAdmin.
   - Sistema de i18n com arquivos de tradução EN/PT/ES.
   - Header global com seletor de idioma funcional.

2. Em seguida, implemente:
   - Autenticação com Supabase.
   - Modelo de `profiles` com `role` e `company_id`.
   - Criação de empresa + usuário owner na tela de signup.
   - Roteamento condicional com base no `role`:
     - superadmin → painel do SaaS
     - owner/admin → painel da empresa
     - cleaner → painel da diarista.

3. Depois, implemente:
   - CRUD de diaristas e clientes.
   - Tela de agenda/schedules para admin.
   - Área mobile-first para diaristas:
     - lista de jobs
     - iniciar/concluir job
     - enviar reporte.

4. Por fim:
   - Esboce a integração com Stripe para trial de 30 dias (fluxo mínimo).
   - Implemente o painel do SuperAdmin com visão geral do SaaS.
   - Garanta responsividade e ajuste visual com Tailwind.
   - Revise o i18n para todas as telas principais.

Comece agora criando a estrutura do projeto, os arquivos de configuração principais e descreva a organização de pastas e componentes.
