import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  const [etapa, setEtapa] = useState(1)
  const [campos, setCampos] = useState(vazio)
  const [foto, setFoto] = useState(null)
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [protocolo, setProtocolo] = useState(null)

  function alterar(e) {
    const { name, value, type, checked } = e.target
    setCampos((c) => ({ ...c, [name]: type === 'checkbox' ? checked : value }))
  }

  function avancar() {
    const novos = {}
    if (etapa === 1 && !campos.descricao.trim()) novos.descricao = ['Descreva o que você observou.']
    if (etapa === 1 && !campos.titulo.trim()) novos.titulo = ['Informe um título curto.']
    if (etapa === 2 && !campos.bairro.trim()) novos.bairro = ['Informe o bairro.']
    setErros(novos)
    if (Object.keys(novos).length === 0) setEtapa((n) => n + 1)
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
        <p>Guarde o número abaixo. Ele identifica o seu relato.</p>
        <p className="protocolo">{protocolo}</p>
        <p className="ajuda">Esta plataforma não acompanha o andamento nem envia retorno ao cidadão.</p>
        <Link className="btn-principal escuro" to="/">Voltar ao início</Link>
      </section>
    )
  }

  return (
    <section className="cartao">
      <p className="eyebrow escuro">Etapa {etapa} de 3</p>
      <form onSubmit={enviar} noValidate>
        {etapa === 1 && (
          <>
            <h1>Descreva a situação</h1>
            <p className="ajuda">Explique o que observou e escolha a categoria que melhor representa o possível foco.</p>
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
          </>
        )}
        {etapa === 2 && (
          <>
            <h1>Informe o local</h1>
            <p className="ajuda">Indique o bairro e o endereço ou ponto de referência para ajudar a localizar o local.</p>
            <Campo rotulo="Bairro" nome="bairro" valor={campos.bairro} onChange={alterar} erros={erros} />
            <Campo rotulo="Endereço ou referência" nome="endereco" valor={campos.endereco} onChange={alterar} erros={erros} />
          </>
        )}
        {etapa === 3 && (
          <>
            <h1>Envie a denúncia</h1>
            <p className="ajuda">Você pode anexar uma foto, mas ela é opcional. Revise as informações antes de enviar.</p>
            <label>
              Foto (opcional)
              <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0] || null)} />
              <Erro erros={erros} nome="foto" />
            </label>
            <div className="cuidados">
              <p><strong>Antes de registrar</strong></p>
              <ul>
                <li>Informe situações observadas ou suspeitas de boa-fé.</li>
                <li>Não entre em terrenos nem se aproxime de áreas perigosas para fotografar.</li>
                <li>Evite incluir rostos, placas ou outros dados pessoais na foto.</li>
              </ul>
            </div>
            <label className="checkbox">
              <input type="checkbox" name="declaracao_boa_fe" checked={campos.declaracao_boa_fe} onChange={alterar} />
              Declaro que as informações são prestadas de boa-fé e são verdadeiras.
            </label>
            <Erro erros={erros} nome="declaracao_boa_fe" />
            <Erro erros={erros} nome="geral" />
          </>
        )}

        <div className="acoes">
          {etapa > 1 && (
            <button type="button" className="secundario" onClick={() => setEtapa((n) => n - 1)}>Voltar</button>
          )}
          {etapa < 3 && <button type="button" onClick={avancar}>Continuar</button>}
          {etapa === 3 && (
            <button type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar denúncia'}</button>
          )}
        </div>
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
