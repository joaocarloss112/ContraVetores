const TOKEN_KEY = 'contravetores.token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, auth = false, form = false } = {}) {
  const headers = {}
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`
  let payload
  if (body !== undefined) {
    if (form) {
      payload = body
    } else {
      headers['Content-Type'] = 'application/json'
      payload = JSON.stringify(body)
    }
  }
  const resp = await fetch(path, { method, headers, body: payload })
  const texto = await resp.text()
  const dados = texto ? JSON.parse(texto) : null
  if (!resp.ok) {
    const erro = new Error('Falha na requisição')
    erro.status = resp.status
    erro.dados = dados
    throw erro
  }
  return dados
}

export const api = {
  criarDenuncia: (formData) =>
    request('/api/denuncias', { method: 'POST', body: formData, form: true }),
  consultarProtocolo: (protocolo) =>
    request(`/api/denuncias/${encodeURIComponent(protocolo)}`),
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: { username, password } }),
  listarDenuncias: () => request('/api/admin/denuncias', { auth: true }),
  detalharDenuncia: (protocolo) =>
    request(`/api/admin/denuncias/${encodeURIComponent(protocolo)}`, { auth: true }),
  registrarAndamento: (protocolo, status, observacao) =>
    request(`/api/admin/denuncias/${encodeURIComponent(protocolo)}/andamentos`, {
      method: 'POST',
      auth: true,
      body: { status, observacao },
    }),
}

export const STATUS_LABEL = {
  RECEBIDA: 'Recebida',
  VALIDADA: 'Validada',
  REJEITADA: 'Rejeitada',
  RESOLVIDA: 'Resolvida',
}

export const CATEGORIAS = [
  'Água parada',
  'Lixo acumulado',
  'Terreno baldio',
  'Animais peçonhentos',
]
