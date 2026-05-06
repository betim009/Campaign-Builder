# Campaign Builder

## Desenvolvimento com Docker

Pré-requisito: Docker Desktop (ou Docker Engine + Compose).

Subir tudo:

    docker compose up

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

Notas:

- Postgres exposto no host em `localhost:5433`.
- Backend em `http://localhost:3001/healthz`.
- Frontend em `http://localhost:5173`.

