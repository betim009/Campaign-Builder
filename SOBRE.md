# SOBRE — Campaign Builder

Última atualização: [2026-05-06 13:59]

## O que é este projeto

O **Campaign Builder** é um sistema web que substitui a planilha (`projeto_escopo.xlsx`) usada pelo cliente como “sistema manual” para **criar, visualizar, organizar e acompanhar campanhas de anúncios** (contexto indica foco futuro em **Meta Ads API**).

Nesta fase, o objetivo é entregar um **frontend navegável e fiel ao design** (referências em `screens/`) com **dados mockados** que representam o XLSX, preparando o terreno para backend, banco e integrações reais.

## Fontes de verdade

- `PLANS.md`: fonte de verdade do plano e estado real do projeto (documento vivo).
- `screens/desktop/*` e `screens/mobile/*`: fonte de verdade visual (design).
- `projeto_escopo.xlsx`: fonte de verdade de regra de negócio (estrutura, campos, parâmetros e objetivos).

Regra importante: **nunca** colocar token/segredos da Meta no frontend; integração real deve passar pelo backend.

## Fluxo do produto (alto nível)

1. **Dashboard (Home)** (`/`)
   - Visão geral com cards de métricas e cards de ação.
   - Lista de campanhas mockadas com ações (ver detalhes/duplicar).
2. **Mensal** (`/mensal`)
   - Dashboard mensal separado (tela distinta do design).
3. **Nova Campanha** (`/nova-campanha`)
   - Formulário completo (steps 1–5 + sidebar) com inputs editáveis e mocks de comportamento.
4. **Financeiro** (`/financeiro`)
   - Filtros (Conta/BM/Período), métricas e gráfico/tabela usando mocks.
5. **Configurações** (`/configuracoes`)
   - Países fixos e configurações (mock).
6. **ROI (Ontem)** (`/roi-ontem`)
   - Tela de ROI D-1 (mock) para orientar decisões (escalar/pausar).

## Estrutura do repositório

- `frontend/`: SPA React + Vite
  - `src/pages/*`: páginas
  - `src/components/*`: componentes reutilizáveis
  - `src/data/*`: mocks base (campanhas, países, financeiro, mensal, ROI)
  - `src/mocks/*`: hooks para interatividade (filtro/period/form state)
- `backend/`: servidor Node + Express (inicial)
  - `GET /healthz` para healthcheck
  - preparado para conexão futura com banco (sem DB/ORM nesta fase)
- `screens/`: imagens de referência do design (desktop/mobile)
- `projeto_escopo.xlsx`: referência de regra de negócio

## Como rodar (local)

Frontend:

    cd frontend
    npm install
    npm run dev

Backend:

    cd backend
    npm install
    npm run dev

Healthcheck:

    curl http://localhost:3001/healthz
