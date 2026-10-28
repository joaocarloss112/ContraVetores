import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, STATUS_LABEL } from '../api.js'
import { BadgeStatus, Historico, formatarData } from '../componentes.jsx'

export default function DenunciaDetalhe() {
  const { protocolo } = useParams()
  const [denuncia, setDenuncia] = useState(null)
  const [erro, setErro] = useState('')
  const [status, setStatus] = useState('VALIDADA')
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)

  function carregar() {
    return api.detalharDenuncia(protocolo)
      .then(setDenuncia)
      .catch(() => setErro('Não foi possível carregar esta denúncia.'))
  }

  useEffect(() => { carregar() }, [protocolo])

  async function registrar(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      setDenuncia(await api.registrarAndamento(protocolo, status, observacao))
      setObservacao('')
    } catch (err) {
      setErro(err.dados?.observacao?.[0] || err.dados?.status?.[0] || 'Não foi possível registrar o andamento.')
    } finally {
      setSalvando(false)
    }
  }

  if (erro && !denuncia) return <section className="cartao"><p className="erro">{erro}</p></section>
  if (!denuncia) return <section className="cartao"><p>Carregando…</p></section>

  return (
    <section className="cartao">
      <p><Link to="/painel">← Voltar ao painel</Link></p>
      <h1>{denuncia.titulo}</h1>
      <p><strong>Protocolo:</strong> <span className="protocolo">{denuncia.protocolo}</span> · <BadgeStatus status={denuncia.status} /></p>
      <p><strong>Categoria:</strong> {denuncia.categoria} · <strong>Bairro:</strong> {denuncia.bairro}</p>
      <p><strong>Endereço:</strong> {denuncia.endereco || '—'}</p>
      <p><strong>Descrição:</strong> {denuncia.descricao}</p>
      <p><strong>Registrada em:</strong> {formatarData(denuncia.criado_em)}</p>
      {denuncia.foto && <img className="foto" src={denuncia.foto} alt="Foto do foco" />}

      <h2>Histórico</h2>
      <Historico andamentos={denuncia.andamentos} />

      <h2>Registrar andamento</h2>
      <form onSubmit={registrar}>
        <label>
          Nova situação
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(STATUS_LABEL).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </label>
        <label>
          Observação
          <textarea rows={3} value={observacao} onChange={(e) => setObservacao(e.target.value)} />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Registrar'}</button>
      </form>
    </section>
  )
}
