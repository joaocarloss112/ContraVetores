# Etapa 04: requisitos da entrega final (HiFi, banco, README e deploy)

Cobre os objetivos combinados para a entrega final: versionamento, README mostrando como usar o site, conexão com banco de dados e HiFi pronto para publicar no Vercel.

## Como estava antes (`47fdaef`, antes do commit do Henrique)

- Front com 5 telas: formulário único de denúncia (sem etapas), consulta por protocolo, login da gestão, painel com filtro de status e detalhe com registro de andamento
- Visual genérico, sem relação com o HiFi
- `db.sqlite3` versionado com usuário de teste e denúncias sintéticas
- `SECRET_KEY`, `DEBUG = True` e `ALLOWED_HOSTS = ['*']` fixos no código, CORS liberado para qualquer origem
- `__pycache__` e fotos de teste versionados

## Como estava no commit do Henrique (`4f6d16f`)

- Removeu consulta, login, painel e detalhe, que ficam fora do escopo do HiFi ("via de mão única")
- Criou a landing e o formulário em 3 etapas com o visual do HiFi
- Limpou o `db.sqlite3`
- Ainda divergia do HiFi: 4 categorias em vez de 8, bairro em texto livre, sem ponto de referência, foto na etapa 3, sem resumo de revisão, sem tela de orientações e com protocolo na tela final
- Banco continuava só em SQLite e sem configuração de deploy

## Como está agora (esta branch)

**HiFi**
- Formulário igual ao HiFi: 8 categorias, 14 bairros de Olinda, endereço obrigatório, ponto de referência, foto opcional na etapa 1 (até 10 MB, com prévia), resumo para revisar e declaração de boa-fé
- Tela "Orientações de prevenção" e tela final sem protocolo
- Melhorias sobre o HiFi: erro mostrado abaixo de cada campo (o HiFi usa um aviso flutuante) e textos ajustados, já que agora a denúncia é gravada de verdade

**Banco**
- Conexão por `DATABASE_URL` (PostgreSQL). Sem a variável, continua usando SQLite local
- API valida categoria, bairro, endereço e tamanho da foto
- Migração `0003`: campo `ponto_referencia` e listas do HiFi

**Configuração e deploy**
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` e CORS vêm de variáveis de ambiente (`.env.example`)
- `render.yaml` (API no Render) e `frontend/vercel.json` (front no Vercel); o front lê a URL da API de `VITE_API_URL`
- `.gitignore`; `db.sqlite3`, `media/` e `__pycache__` saem do repositório
- `dev.py`: um comando prepara tudo (venv, dependências, migrações, usuário da gestão) e sobe API e site juntos
- O Django lê o `.env` da raiz sozinho (python-dotenv); para usar o Supabase basta colar a `DATABASE_URL` nele

**README**
- Passo a passo de uso do site com capturas, rotas da API, setup local, variáveis, guia de deploy (Supabase + Render + Vercel) e testes
- `docs/etapa-02/` com os documentos entregues: escolhas computacionais, contratos de API, arquitetura e modelagem de dados

## Como testar

```bash
git switch etapa-04-requisitos
python dev.py --seed         # prepara tudo e sobe API (8000) e site (5173)
python manage.py test        # 12 testes (com o venv ativado)
```

Validado com PostgreSQL 16: migrações, testes e o fluxo completo no navegador (desktop e celular), com a denúncia e a foto gravadas no banco. Também validado em modo produção (`DEBUG=false`, gunicorn, front e API em origens separadas).

## Atenção

- Ao puxar esta branch, o `db.sqlite3` local de vocês é apagado, porque saiu do versionamento. Basta rodar `python manage.py migrate` (e `seed_denuncias` se quiserem dados)
- Falta publicar: criar o banco no Supabase, a API no Render e o front no Vercel (passo a passo no README) e colocar o link no topo do README
- No Render gratuito as fotos somem a cada novo deploy. Para guardar as fotos de vez, falta um storage externo
