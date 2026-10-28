export const CATEGORIAS = [
  'Água parada',
  'Lixo e entulho',
  'Terreno abandonado',
  'Pneus e recipientes acumulando água',
  'Esgoto ou água contaminada',
  'Animais ou pragas associados a possíveis focos',
  'Piscinas sem manutenção',
  'Outro possível foco de vetores',
]

export const BAIRROS = [
  'Peixinhos',
  'Rio Doce',
  'Casa Caiada',
  'Bairro Novo',
  'Sítio Novo',
  'Ouro Preto',
  'Jardim Atlântico',
  'Águas Compridas',
  'Amaro Branco',
  'Varadouro',
  'Carmo',
  'Fragoso',
  'Tabajara',
  'Outro bairro de Olinda',
]

export const FOTO_TAMANHO_MAXIMO = 10 * 1024 * 1024

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const api = {
  criarDenuncia: async (formData) => {
    let resp
    try {
      resp = await fetch(`${API_URL}/api/denuncias`, { method: 'POST', body: formData })
    } catch {
      const erro = new Error('Sem conexão com o servidor')
      erro.dados = { geral: ['Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'] }
      throw erro
    }
    const texto = await resp.text()
    let dados = null
    try {
      dados = JSON.parse(texto)
    } catch {
      dados = null
    }
    if (!resp.ok) {
      const erro = new Error('Falha na requisição')
      erro.status = resp.status
      erro.dados = dados
      throw erro
    }
    return dados
  },
}
