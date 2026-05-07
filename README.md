# Campaign Builder

## Desenvolvimento com Docker (recomendado)

Pré-requisito: Docker Desktop (ou Docker Engine + Compose).

### 1) Configurar variáveis (opcional)

Para habilitar sync/criação real via Meta Graph/Marketing API no backend, crie um `.env` na raiz a partir do exemplo:

    cp .env.example .env

Preencha (opcional):

- `META_ACCESS_TOKEN=...`
- `META_GRAPH_VERSION=v20.0`
- `META_SYNC_PROVIDER=` (vazio = auto; `stub` força stub; `meta` força Meta Graph sem fallback)

Importante (segurança operacional):

- Toda criação de campanha via backend deve nascer obrigatoriamente como `status=PAUSED`.

### 2) Subir o stack

    docker compose up -d

O backend roda automaticamente `npm run migrate` e `npm run seed` ao subir (ver `docker-compose.yml`).

Parar (mantém volumes):

    docker compose stop

Retomar:

    docker compose start

Reiniciar:

    docker compose restart

Derrubar containers (mantém volume do banco):

    docker compose down

Limpar apenas o banco (apaga dados do Postgres):

    docker compose down
    docker volume rm campaign-builder_campaign_builder_db

Obs: o nome do volume pode variar conforme o nome da pasta/projeto. Se necessário:

    docker volume ls | rg campaign_builder_db

### 3) Smoke tests (host)

    curl http://localhost:3001/healthz
    curl http://localhost:3001/api
    curl http://localhost:3001/api/countries

### Endereços

- Postgres exposto no host em `localhost:5433`.
- Backend em `http://localhost:3001/healthz`.
- Frontend em `http://localhost:5173`.

## Desenvolvimento local (sem Docker para Node)

Pré-requisitos:

- Node.js 22+
- npm
- Postgres disponível (recomendação: usar apenas o serviço `db` via Docker)

### 1) Subir apenas o banco (recomendado)

    docker compose up -d db

### 2) Backend (local)

Em um terminal:

    cd backend
    npm ci
    export DATABASE_URL=postgres://postgres:postgres@localhost:5433/campaign_builder
    npm run migrate
    npm run seed
    npm run dev

Opcional (Meta):

    export META_GRAPH_VERSION=v20.0
    export META_ACCESS_TOKEN=...
    export META_SYNC_PROVIDER=

### 3) Frontend (local)

Em outro terminal:

    cd frontend
    npm ci
    VITE_BACKEND_URL=http://localhost:3001 npm run dev

Abrir:

- `http://localhost:5173`

## Criação real de campanhas (modo seguro: PAUSED)

Pré-requisitos:

- DB habilitado (`DATABASE_URL` configurado).
- Token válido no backend (`META_ACCESS_TOKEN` ou `POST /api/meta/tokens`).

Salvar token via API (opcional):

    curl -X POST http://localhost:3001/api/meta/tokens \
      -H 'Content-Type: application/json' \
      -d '{"accessToken":"<token>","metaUserId":"<opcional>","expiresAt":"<opcional-iso>"}'

Fluxo (alto nível):

1. Criar uma campanha (draft) e gerar por país no UI (isso cria registros em `generated_campaigns`).
2. Usar `POST /api/meta/campaigns` para criar a campanha real na Meta a partir de um `generatedCampaignId`.

Criar campanha real (sempre força `PAUSED` no backend):

    curl -X POST http://localhost:3001/api/meta/campaigns \
      -H 'Content-Type: application/json' \
      -d '{"generatedCampaignId":"<uuid>","metaAdAccountId":"act_<digits>","objective":"OUTCOME_TRAFFIC"}'

Notas:

- `metaAdAccountId` deve estar no formato `act_<digits>` (ex: `act_259174718403969`).
- Se a campanha já tiver objetivo persistido no banco (`campaigns.objective_key`), o `objective` pode ser omitido.

Consultar campanha no Graph via backend:

    curl http://localhost:3001/api/meta/campaigns/<meta_campaign_id>
