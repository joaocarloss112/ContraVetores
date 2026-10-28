import { STATUS_LABEL } from './api.js'

export function formatarData(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Recife',
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function BadgeStatus({ status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{STATUS_LABEL[status] || status}</span>
}

export function Historico({ andamentos }) {
  if (!andamentos?.length) return <p className="ajuda">Nenhum andamento registrado ainda.</p>
  return (
    <ol className="historico">
      {andamentos.map((a, i) => (
        <li key={i}>
          <BadgeStatus status={a.status} />
          <span className="data">{formatarData(a.criado_em)}</span>
          {a.observacao && <p>{a.observacao}</p>}
          {a.autor && <small>por {a.autor}</small>}
        </li>
      ))}
    </ol>
  )
}
