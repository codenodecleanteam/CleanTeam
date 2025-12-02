# Plano de Desenvolvimento CleanTeams

## 1. Infra de dados e configuração
- Definir esquema no Supabase (companies, profiles, cleaners, clients, schedules, reports) via Drizzle.
- Rodar migrações (`supabase db push`) e provisionar seeds mínimos.
- Criar políticas RLS iniciais.
- *Entrega*: `chore: configurar banco Supabase` + `vercel deploy --prod`.

## 2. Autenticação real e roteamento por roles
- Integrar Supabase Auth no cliente, substituir lógica mock.
- Signup cria empresa + profile + placeholders de assinatura.
- Garantir guardas de rota para superadmin, owner/admin e cleaner.
- *Entrega*: `feat: autenticação Supabase e roteamento` + deploy.

## 3. Painel Owner/Admin – CRUDs base
- CRUD de diaristas e clientes usando React Query.
- Dashboard com contagens e filtros básicos.
- *Entrega*: `feat: painel admin com CRUDs` + deploy.

## 4. Agenda e fluxo Cleaner
- Tela de schedules com criação/edição, validação de conflitos e visão semanal.
- App mobile-first do cleaner (listar jobs, iniciar/concluir, reports).
- *Entrega*: `feat: agenda e área da diarista` + deploy.

## 5. Painel SuperAdmin e métricas
- Consultas agregadas de empresas, status de trial/assinatura e contagens globais.
- Ação de bloquear/reativar tenants.
- *Entrega*: `feat: painel superadmin` + deploy.

## 6. Stripe e bloqueio por assinatura
- Integrar Stripe Billing com trial de 30 dias no signup.
- Sincronizar status da assinatura e bloquear acesso ao expirar.
- *Entrega*: `feat: stripe e controle de acesso` + deploy.

## 7. I18n completo, responsividade e QA
- Revisar traduções, responsividade e experiência mobile.
- Rodar lint/build finais, revisar `.env` e documentação curta.
- *Entrega*: `chore: ajustes finais e documentação` + deploy.
