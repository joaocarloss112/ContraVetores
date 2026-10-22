# ContraVetores

> Central de denúncias de focos de proliferação de vetores em Olinda (PE).

Plataforma web colaborativa onde a população registra focos de risco (água parada, lixo acumulado, terrenos baldios, animais peçonhentos) com foto e localização. Os relatos viram dados organizados que orientam a fiscalização da vigilância em saúde e encurtam o tempo entre o surgimento de um foco e a resposta do poder público.

Projeto acadêmico de inovação social (UNICAP), patrocínio simulado da Secretaria de Saúde da Prefeitura de Olinda.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Back-end | Python, Django 5.2, Django REST Framework |
| Autenticação | JWT (djangorestframework-simplejwt) |
| Banco de dados | SQLite em desenvolvimento; PostgreSQL previsto para produção (psycopg) |
| Dados geográficos | djangorestframework-gis (previsto) |
| Upload de imagens | Pillow |
| CORS | django-cors-headers |

## Estrutura do repositório

```
contravetores/        Configuração do projeto (settings, urls, wsgi, asgi)
denuncias/            App principal
  models.py           Modelos Usuario e Denuncia
  serialyzers.py      Serializers da API
  views.py            Endpoints (criar, consultar, listar)
  admin.py            Configuração do Django Admin
  migrations/         Migrações do banco
media/                Fotos enviadas nas denúncias
manage.py
requirements.txt
```

## Modelo de dados

**Usuario** (estende o usuário padrão do Django): acesso da gestão municipal.
- `tipo`: perfil do usuário (GESTAO).
- `telefone`: contato opcional.

**Denuncia**: o foco reportado pela população. Anônima, sem vínculo com usuário.
- `protocolo`: código público gerado automaticamente, usado para acompanhar a denúncia.
- `titulo`, `categoria`, `descricao`: o que foi reportado.
- `foto`: imagem do foco.
- `bairro`, `endereco`: onde fica (padrão Olinda).
- `declaracao_boa_fe`: confirmação obrigatória de que o relato é verdadeiro.
- `criado_em`: data e hora do registro.

## API

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| POST | `/api/denuncias` | Público | Registra uma denúncia |
| GET | `/api/denuncias/{protocolo}` | Público | Consulta uma denúncia pelo protocolo |
| GET | `/api/admin/denuncias` | Autenticado | Lista todas as denúncias para a gestão |
| POST | `/auth/login` | Público | Autentica e devolve o token JWT |
| POST | `/auth/refresh` | Público | Renova o token JWT |
| — | `/admin/` | Autenticado | Painel administrativo do Django |

As respostas são em JSON. As rotas autenticadas exigem o header `Authorization: Bearer <token>`.

## Como rodar localmente

```bash
git clone https://github.com/joaocarloss112/ContraVetores
cd ContraVetores

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # cria o acesso da gestão para o /admin
python manage.py runserver
```

A API fica em `http://localhost:8000`. O painel administrativo em `http://localhost:8000/admin/`.

## Configuração para produção

O `settings.py` atual é de desenvolvimento. Antes de publicar:
- Mover `SECRET_KEY`, `DEBUG` e `ALLOWED_HOSTS` para variáveis de ambiente.
- Definir `DEBUG = False`.
- Trocar o banco de SQLite para PostgreSQL (local ou hospedado no Supabase), via `DATABASE_URL`.
- Servir os arquivos de mídia por um storage adequado.

## Equipe

Gabriel Martins, Rafael Sampaio, João Carlos, Marina Mendes, Lucas Sebastião e Henrique Rojas.

## Status

MVP universitário em desenvolvimento (Etapa 04). O escopo segue a estratégia de selecionar os requisitos que fazem sentido para o projeto: repositório organizado, banco formalizado, fluxos principais validados com dados realistas de Olinda e um painel de indicadores para a gestão.
