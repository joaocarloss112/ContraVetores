import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, STATUS_LABEL } from '../api.js'
import { Historico, BadgeStatus, formatarData } from '../componentes.jsx'

export default function Consulta() {
  const { protocolo: urlProtocolo } = useParams()
  const [protocolo, setProtocolo] = useState(urlProtocolo || '')
  const [denuncia, setDenuncia] = useState(null)
  const [erro, setErro] = useState('')
  const [buscando, setBuscando] = useState(false)
  const navigate = useNavigate()

  async function buscar(valor) {
    const limpo = valor.trim().toUpperCase()
    if (!limpo) return
    setBuscando(true)
    setErro('')
    setDenuncia(null)
    try {
      setDenuncia(await api.consultarProtocolo(limpo))
    } catch (err) {
      setErro(err.status === 404 ? 'Protocolo não encontrado. Confira os oito caracteres.' : 'Falha ao consultar. Tente novamente.')
    } finally {
      setBuscando(false)
    }
  }

  useEffect(() => {
    if (urlProtocolo) {
      setProtocolo(urlProtocolo)
      buscar(urlProtocolo)
    }
  }, [urlProtocolo])

  function enviar(e) {
    e.preventDefault()
    if (protocolo.trim()) navigate(`/consulta/${protocolo.trim().toUpperCase()}`)
  }

  return (
    <section className="cartao">
      <h1>Acompanhar denúncia</h1>
      <form onSubmit={enviar} className="linha">
        <input
          placeholder="Protocolo (8 caracteres)"
          value={protocolo}
          onChange={(e) => setProtocolo(e.target.value)}
          maxLength={20}
        />
        <button type="submit" disabled={buscando}>Consultar</button>
      </form>
      {erro && <p className="erro">{erro}</p>}
      {denuncia && (
        <div className="detalhe">
          <h2>{denuncia.titulo}</h2>
          <p><strong>Protocolo:</strong> <span className="protocolo">{denuncia.protocolo}</span></p>
          <p><strong>Situação:</strong> <BadgeStatus status={denuncia.status} /></p>
          <p><strong>Categoria:</strong> {denuncia.categoria} · <strong>Bairro:</strong> {denuncia.bairro}</p>
          <p><strong>Registrada em:</strong> {formatarData(denuncia.criado_em)}</p>
          <h3>Andamento</h3>
          <Historico andamentos={denuncia.andamentos} />
          <p className="ajuda">Situações possíveis: {Object.values(STATUS_LABEL).join(', ')}.</p>
        </div>
      )}
    </section>
  )
}
