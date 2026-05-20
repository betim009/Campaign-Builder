# PLANS.infra — Campaign Builder (Infraestrutura e Deploy)

Última atualização: [2026-05-20 17:48]

Este documento é a fonte de verdade para tudo relacionado à infraestrutura, deploy e operação do Campaign Builder em produção.

---

## Navegação

- VPS e ambiente: ver `## VPS (Hostinger)`
- Portas e serviços: ver `## Portas e Serviços`
- Checklist de deploy: ver `## Checklist de Deploy`
- Variáveis de ambiente: ver `## Variáveis de Ambiente`
- Arquivos de infra a criar: ver `## Arquivos de Infra`
- Observações e riscos: ver `## Observações e Riscos`

---

## VPS (Hostinger)

Última atualização: [2026-05-20 12:00]

| Item | Valor |
|---|---|
| Provedor | Hostinger |
| Plano | KVM 4 |
| SO | Ubuntu 24.04 LTS |
| IP | 2.24.112.56 |
| Acesso | `ssh root@2.24.112.56` |
| Disco | 192 GB |

### O que já está instalado no VPS

- Docker + Docker Compose
- Git
- Nginx
- Node.js v24.15.0 (via NVM)
- PM2
- UFW (portas 80, 443, 8080 abertas)
- Certbot

### Projetos já hospedados

| Projeto | Diretório | Portas |
|---|---|---|
| Bikkoo | `/var/www/bikkoo` | Backend: 3000, PostgreSQL: 5432, Nginx: 80/443/8080 |

---

## Portas e Serviços

Última atualização: [2026-05-20 12:00]

Portas reservadas para o Campaign Builder (não conflitam com o Bikkoo):

| Serviço | Porta interna | Porta externa |
|---|---|---|
| Backend Node.js | 3001 | — |
| PostgreSQL | 5433 | — (só interna Docker) |
| Frontend (build estático) | — | Nginx 80/443 (novo server block) |
| API proxy Nginx | — | 8081 |

> ⚠️ Nunca usar as portas 3000, 5432 ou 8080 — reservadas para o Bikkoo.

---

## Checklist de Deploy

Última atualização: [2026-05-20 17:48]

### P-DEPLOY-1 — Preparar projeto para produção
- [x] Criar `backend/Dockerfile` (node:20-slim + openssl)
- [x] Criar `infra/docker-compose.prod.yml` (backend + postgres, portas 3001/5433)
- [x] Criar `infra/nginx.conf` (frontend estático + proxy API porta 8081)
- [x] Criar `backend/.env.production.example` com todas as variáveis necessárias
- [x] Criar `deploy.sh` (clone → env → Docker build → Nginx → UFW)
- [x] Criar `frontend/.env.production` com `VITE_BACKEND_URL=https://dominio.com:8081`
- [x] Garantir que `npm run build` gera `frontend/dist/` corretamente

### P-DEPLOY-2 — Configurar VPS
- [ ] Clonar repositório em `/var/www/campaign-builder`
- [ ] Criar `.env` de produção (DB_PASSWORD, META_ACCESS_TOKEN, etc.)
- [ ] Rodar `bash deploy.sh`
- [ ] Verificar containers: `docker ps`
- [ ] Testar API: `curl http://localhost:3001/healthz`
- [ ] Testar frontend: `curl -I http://localhost/`

### P-DEPLOY-3 — Domínio e SSL
- [ ] Definir domínio do projeto
- [ ] Adicionar registro A no DNS apontando para `2.24.112.56`
- [ ] Gerar certificado: `certbot --nginx -d dominio.com -d www.dominio.com`
- [ ] Liberar porta 8081 no UFW: `ufw allow 8081`
- [ ] Verificar renovação automática do SSL

### P-DEPLOY-4 — Validação pós-deploy
- [ ] Acessar frontend via HTTPS no domínio
- [ ] Testar login/autenticação
- [ ] Testar endpoints da API via HTTPS
- [ ] Verificar integração Meta (status/validate) em produção
- [ ] Verificar logs: `docker logs campaign_api`

---

## Variáveis de Ambiente

Última atualização: [2026-05-20 12:00]

```bash
# App
APP_PORT=3001

# Banco
DB_NAME=campaign_db
DB_USER=campaign_user
DB_PASSWORD=GERAR_COM_openssl_rand_hex_32
DATABASE_URL=postgresql://campaign_user:SENHA@postgres:5433/campaign_db

# Meta Ads
META_ACCESS_TOKEN=
META_AD_ACCOUNT_ID=
META_PAGE_ID=
META_GRAPH_VERSION=v20.0
META_SYNC_PROVIDER=stub  # trocar para "meta" em produção

# Frontend
VITE_BACKEND_URL=https://dominio.com:8081
```

> Gerar senhas seguras com: `openssl rand -hex 32`

---

## Arquivos de Infra a Criar

Última atualização: [2026-05-20 17:48]

| Arquivo | Descrição |
|---|---|
| `backend/Dockerfile` | Build multi-stage node:20-slim + openssl |
| `infra/docker-compose.prod.yml` | Backend + PostgreSQL em rede interna Docker |
| `infra/nginx.conf` | Frontend estático + proxy API porta 8081 |
| `backend/.env.production.example` | Template de variáveis de produção |
| `deploy.sh` | Script completo de deploy |
| `frontend/.env.production` | VITE_BACKEND_URL para produção |

---

## Arquitetura em Produção

Última atualização: [2026-05-20 12:00]

```
Browser
  │
  :80/:443 (Nginx)
  ├── dominio.com          → /var/www/campaign-builder/frontend/dist/ (estático)
  └── dominio.com:8081     → Node.js :3001 (Docker)
                                    ↓
                            PostgreSQL :5433 (Docker, rede interna)
```

---

## Observações e Riscos

Última atualização: [2026-05-20 12:00]

- Frontend React **precisa de build** (`npm run build`) — não serve o Vite diretamente em produção
- O `VITE_BACKEND_URL` deve apontar para **HTTPS** para evitar mixed content no navegador
- Porta 8081 deve ser liberada no UFW antes de testar
- **Nunca** expor `META_ACCESS_TOKEN` no frontend ou em logs públicos
- O Nginx do Bikkoo já está configurado — o Campaign Builder deve adicionar um **novo server block** sem modificar o existente
