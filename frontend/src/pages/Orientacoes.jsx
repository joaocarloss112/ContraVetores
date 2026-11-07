import { Link } from 'react-router-dom'

const ORIENTACOES = [
  { icone: '💧', titulo: 'Água parada', texto: 'Observe recipientes, lonas e áreas onde a água pode ficar acumulada após a chuva.' },
  { icone: '🛞', titulo: 'Pneus e entulho', texto: 'Pneus expostos, sucata e materiais descartados podem acumular água.' },
  { icone: '🗑️', titulo: 'Lixo e esgoto', texto: 'Descarte irregular e água contaminada devem ser descritos com clareza.' },
  { icone: '🏠', titulo: 'Terrenos e piscinas', texto: 'Informe a localização suspeita sem entrar no local.' },
]

export default function Orientacoes() {
  return (
    <div className="pagina">
      <Link className="link-voltar" to="/">Voltar ao início</Link>
      <h1 className="titulo-pagina">Orientações de prevenção</h1>
      <p className="subtitulo-pagina">Como reconhecer possíveis focos sem se expor a riscos.</p>
      <ul className="lista-orientacoes">
        {ORIENTACOES.map((item) => (
          <li key={item.titulo}>
            <span className="orientacao-icone" aria-hidden="true">{item.icone}</span>
            <div>
              <h2>{item.titulo}</h2>
              <p>{item.texto}</p>
            </div>
          </li>
        ))}
      </ul>
      <Link className="botao-grande escuro" to="/denunciar">Registrar denúncia</Link>
    </div>
  )
}
