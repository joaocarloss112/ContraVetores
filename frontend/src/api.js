export const CATEGORIAS = [
  'Água parada',
  'Lixo acumulado',
  'Terreno baldio',
  'Animais peçonhentos',
]

export const api = {
  criarDenuncia: async (formData) => {
    const resp = await fetch('/api/denuncias', { method: 'POST', body: formData })
    const texto = await resp.text()
    const dados = texto ? JSON.parse(texto) : null
    if (!resp.ok) {
      const erro = new Error('Falha na requisição')
      erro.status = resp.status
      erro.dados = dados
      throw erro
    }
    return dados
  },
}
