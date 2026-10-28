import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { BadgeStatus, formatarData } from '../componentes.jsx'

export default function Painel() {
  const [denuncias, setDenuncias] = useState(null)
  const [erro, setErro] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  useEffect(() => {
    api.listarDenuncias()
      .then(setDenuncias)
      .catch((err) => setErro(err.status === 401 || err.status === 403
        ? 'Sessão expirada. Entre novamente.'
        : 'Não foi possível carregar as denúncias.'))
  }, [])

  const visiveis = (denuncias || []).filter((d) => !filtroStatus || d.status === filtroStatus)

  return (
    <section className="cartao">
      <h1>Painel de denúncias</h1>
      {erro && <p className="erro">{erro}</p>}
      <div className="linha">
        <label>
          Situação
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="">Todas</option>
            <option value="RECEBIDA">Recebida</option>
            <option value="VALIDADA">Validada</option>
            <option value="REJEITADA">Rejeitada</option>
            <option value="RESOLVIDA">Resolvida</option>
          </select>
        </label>
        <span className="ajuda">{denuncias ? `${visiveis.length} de ${denuncias.length}` : 'Carregando…'}</span>
      </div>
      {denuncias && (
        <table className="tabela">
          <thead>
            <tr>
              <th>Protocolo</th>
              <th>Foco</th>
              <th>Bairro</th>
              <th>Situação</th>
              <th>Registrada em</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((d) => (
              <tr key={d.protocolo}>
                <td><Link to={`/painel/${d.protocolo}`}>{d.protocolo}</Link></td>
                <td>{d.titulo}<br /><small>{d.categoria}</small></td>
                <td>{d.bairro}</td>
                <td><BadgeStatus status={d.status} /></td>
                <td>{formatarData(d.criado_em)}</td>
              </tr>
            ))}
            {visiveis.length === 0 && (
              <tr><td colSpan={5} className="ajuda">Nenhuma denúncia nesta situação.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  )
}
