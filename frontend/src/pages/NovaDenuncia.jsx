import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, CATEGORIAS } from '../api.js'

const vazio = {
  categoria: CATEGORIAS[0],
  titulo: '',
  descricao: '',
  bairro: '',
  endereco: '',
  declaracao_boa_fe: false,
}

export default function NovaDenuncia() {
  const [campos, setCampos] = useState(vazio)
  const [foto, setFoto] = useState(null)
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [protocolo, setProtocolo] = useState(null)
  const navigate = useNavigate()

  function alterar(e) {
    const { name, value, type, checked } = e.target
    setCampos((c) => ({ ...c, [name]: type === 'checkbox' ? checked : value }))
  }

  async function enviar(e) {
    e.preventDefault()
    setErros({})
    setEnviando(true)
    const form = new FormData()
    Object.entries(campos).forEach(([k, v]) => form.append(k, v))
    if (foto) form.append('foto', foto)
    try {
      const criada = await api.criarDenuncia(form)
      setProtocolo(criada.protocolo)
    } catch (err) {
      setErros(err.dados || { geral: ['Não foi possível enviar. Tente novamente.'] })
    } finally {
      setEnviando(false)
    }
  }

  if (protocolo) {
    return (
      <section className="cartao">
        <h1>Denúncia registrada</h1>
        <p>Guarde o protocolo para acompanhar o andamento:</p>
        <p className="protocolo">{protocolo}</p>
        <div className="acoes">
          <button onClick={() => navigate(`/consulta/${protocolo}`)}>Acompanhar agora</button>
          <button className="secundario" onClick={() => { setProtocolo(null); setCampos(vazio); setFoto(null) }}>
            Nova denúncia
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="cartao">
      <h1>Denunciar foco de vetores</h1>
      <p className="ajuda">Relate água parada, lixo acumulado, terreno baldio ou animais peçonhentos em Olinda.</p>
      <form onSubmit={enviar} noValidate>
        <label>
          Tipo de foco
          <select name="categoria" value={campos.categoria} onChange={alterar}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <Campo rotulo="Título" nome="titulo" valor={campos.titulo} onChange={alterar} erros={erros} maxLength={150} />
        <label>
          Descrição
          <textarea name="descricao" rows={4} value={campos.descricao} onChange={alterar} />
          <Erro erros={erros} nome="descricao" />
        </label>
        <Campo rotulo="Bairro" nome="bairro" valor={campos.bairro} onChange={alterar} erros={erros} />
        <Campo rotulo="Endereço ou referência" nome="endereco" valor={campos.endereco} onChange={alterar} erros={erros} />
        <label>
          Foto do foco
          <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0] || null)} />
          <Erro erros={erros} nome="foto" />
        </label>
        <label className="checkbox">
          <input type="checkbox" name="declaracao_boa_fe" checked={campos.declaracao_boa_fe} onChange={alterar} />
          Declaro que as informações são prestadas de boa-fé e são verdadeiras.
        </label>
        <Erro erros={erros} nome="declaracao_boa_fe" />
        <Erro erros={erros} nome="geral" />
        <button type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar denúncia'}</button>
      </form>
    </section>
  )
}

function Campo({ rotulo, nome, valor, onChange, erros, maxLength }) {
  return (
    <label>
      {rotulo}
      <input name={nome} value={valor} onChange={onChange} maxLength={maxLength} />
      <Erro erros={erros} nome={nome} />
    </label>
  )
}

function Erro({ erros, nome }) {
  if (!erros[nome]) return null
  return <span className="erro">{erros[nome].join(' ')}</span>
}
