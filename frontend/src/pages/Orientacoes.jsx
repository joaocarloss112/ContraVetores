import { Link } from 'react-router-dom'

const ORIENTACOES = [
  { icone: '💧', titulo: 'Água parada', texto: 'Observe recipientes, lonas e áreas onde a água pode ficar acumulada após a chuva.' },
  { icone: '🛞', titulo: 'Pneus e entulho', texto: 'Pneus expostos, sucata e materiais descartados podem acumular água.' },
  { icone: '🗑️', titulo: 'Lixo e esgoto', texto: 'Descarte irregular e água contaminada devem ser descritos com clareza.' },
  { icone: '🏠', titulo: 'Terrenos e piscinas', texto: 'Informe a localização suspeita sem entrar no local.' },
]

export default function Orientacoes() {
  return (
    <>
      <h1 className="titulo-pagina">Orientações de prevenção</h1>
      <p className="subtitulo-pagina">Como reconhecer possíveis focos sem se expor a riscos.</p>
      <section className="grade-orientacoes">
        {ORIENTACOES.map((item) => (
          <article key={item.titulo} className="orientacao">
            <span className="orientacao-icone" aria-hidden="true">{item.icone}</span>
            <h2>{item.titulo}</h2>
            <p>{item.texto}</p>
          </article>
        ))}
      </section>
      <Link className="btn-principal escuro" to="/denunciar">Registrar uma denúncia</Link>
    </>
  )
}
