# Especificação dos Contratos de API

> Documento entregue na **Etapa 02/06** (14/10/2026), com a interface **prevista**. As rotas implementadas hoje estão no [README](../../README.md#api).

ContraVetores, Olinda · Gabriel Martins, Rafael Sampaio, João Carlos, Marina Mendes, Lucas Sebastião, Henrique Rojas

Este documento especifica os contratos da API do ContraVetores: a lista de operações que o sistema oferece e, para cada uma, o que ela recebe e o que devolve. Em outras palavras, define como as partes do sistema (aplicativo, servidor e banco de dados) se comunicam. Serve de acordo entre quem desenvolve o aplicativo e quem desenvolve o servidor, para que ambos construam a partir da mesma referência.

## Convenções

- As respostas são enviadas no formato JSON.
- Cada operação é identificada por um método (GET consulta, POST cria, PATCH atualiza) e um caminho, chamado de rota.
- As rotas marcadas como restritas exigem autenticação por token. O cidadão registra denúncias sem login, e a denúncia pode ser anônima (conforme a LGPD).
- Perfis de acesso: Público (cidadão), Agente de saúde e Gestão municipal.

## Resumo das rotas

| Método | Rota | O que faz | Acesso |
| --- | --- | --- | --- |
| POST | /auth/login | Autentica agente ou gestão e devolve um token | Restrito |
| POST | /denuncias | Registra uma denúncia com foto, descrição e local | Público |
| GET | /denuncias | Lista denúncias validadas para o mapa, com filtros | Público |
| GET | /denuncias/{protocolo} | Acompanha uma denúncia pelo protocolo | Público |
| GET | /admin/denuncias | Lista todas as denúncias para o painel | Agente, Gestão |
| GET | /admin/denuncias/{id} | Detalha uma denúncia | Agente, Gestão |
| PATCH | /admin/denuncias/{id} | Valida, rejeita, prioriza ou muda o status | Agente |
| GET | /indicadores | Indicadores para o dashboard da Prefeitura | Gestão |

## Detalhamento das principais rotas

### POST /denuncias: registrar uma denúncia

Qualquer cidadão pode registrar. Pode ser anônima.

Entrada (corpo da requisição):

```json
{
  "tipoFoco": "agua_parada",
  "descricao": "Piscina abandonada com água parada",
  "fotoUrl": "https://.../foto.jpg",
  "lat": -8.0089,
  "lng": -34.8553,
  "endereco": "Rua do Sol, 45, Varadouro",
  "anonima": true
}
```

Resposta (201):

```json
{
  "protocolo": "DEN-2026-00842",
  "status": "pendente"
}
```

### GET /denuncias: mapa de denúncias validadas

Consulta pública. Retorna apenas denúncias já validadas pelos agentes.

Filtros (parâmetros na rota): tipo, status e bairro.

```json
{
  "denuncias": [
    {
      "protocolo": "DEN-2026-00842",
      "tipoFoco": "agua_parada",
      "lat": -8.0089, "lng": -34.8553,
      "status": "validada"
    }
  ]
}
```

### PATCH /admin/denuncias/{id}: validar e dar andamento

Usada pelo agente de saúde para validar, rejeitar ou mudar o status. Cada mudança fica registrada no histórico da denúncia.

```json
{
  "status": "validada",
  "observacao": "Foco confirmado em vistoria de campo"
}
```

## Códigos de resposta

| Código | Significado |
| --- | --- |
| 200 | Operação realizada com sucesso |
| 201 | Recurso criado com sucesso |
| 400 | Dados enviados inválidos |
| 401 | Falta de autenticação (sem token) |
| 403 | Perfil sem permissão para a operação |
| 404 | Recurso não encontrado |

*Este documento descreve a interface prevista do sistema. Os detalhes podem ser ajustados durante o desenvolvimento sem alterar o comportamento descrito.*
